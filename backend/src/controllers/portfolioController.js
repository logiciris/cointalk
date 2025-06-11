const database = require('../utils/database');

class PortfolioController {
  // 포트폴리오 조회
  async getPortfolio(req, res) {
    try {
      const userId = req.user.id;

      // 지갑 잔고 조회
      let wallet = await database.query(
        'SELECT balance FROM user_wallets WHERE user_id = ?',
        [userId]
      );

      // 지갑이 없으면 생성
      if (!wallet || wallet.length === 0) {
        await database.query(
          'INSERT INTO user_wallets (user_id, balance) VALUES (?, 10000.00)',
          [userId]
        );
        wallet = [{ balance: 10000.00 }];
      }

      // 보유 코인 조회
      const holdings = await database.query(`
        SELECT 
          symbol,
          coin_name,
          total_amount,
          avg_price,
          total_invested
        FROM portfolio_holdings 
        WHERE user_id = ? AND total_amount > 0
        ORDER BY total_invested DESC
      `, [userId]);

      // 현재 가격 정보 (모의 데이터)
      const currentPrices = {
        'BTC': 67234.50,
        'ETH': 3456.78,
        'ADA': 0.4567,
        'SOL': 158.64,
        'XRP': 1.12
      };

      // 포트폴리오 계산
      let totalValue = 0;
      let totalInvested = 0;
      const enrichedHoldings = holdings.map(holding => {
        const currentPrice = currentPrices[holding.symbol] || holding.avg_price;
        const currentValue = holding.total_amount * currentPrice;
        const profit = currentValue - holding.total_invested;
        const profitPercent = holding.total_invested > 0 ? (profit / holding.total_invested) * 100 : 0;

        totalValue += currentValue;
        totalInvested += holding.total_invested;

        return {
          symbol: holding.symbol,
          name: holding.coin_name,
          amount: parseFloat(holding.total_amount),
          avgPrice: parseFloat(holding.avg_price),
          currentPrice: currentPrice,
          value: currentValue,
          profit: profit,
          profitPercent: profitPercent,
          allocation: 0 // 나중에 계산
        };
      });

      // 할당 비율 계산
      enrichedHoldings.forEach(holding => {
        holding.allocation = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
      });

      const totalProfit = totalValue - totalInvested;
      const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

      // 24시간 변화 (모의 데이터 - 실제로는 이전 가격과 비교)
      const dayChange = totalValue * 0.028; // 2.8% 가정
      const dayChangePercent = 2.8;

      res.json({
        success: true,
        data: {
          wallet: {
            balance: parseFloat(wallet[0].balance)
          },
          portfolio: {
            totalValue: totalValue,
            totalInvested: totalInvested,
            totalProfit: totalProfit,
            totalProfitPercent: totalProfitPercent,
            dayChange: dayChange,
            dayChangePercent: dayChangePercent,
            holdings: enrichedHoldings
          }
        }
      });
    } catch (error) {
      console.error('Get portfolio error:', error);
      res.status(500).json({
        success: false,
        message: '포트폴리오 조회 중 오류가 발생했습니다.'
      });
    }
  }

  // 코인 매수
  async buyCoin(req, res) {
    try {
      const userId = req.user.id;
      const { symbol, coinName, amount, price } = req.body;

      if (!symbol || !coinName || !amount || !price) {
        return res.status(400).json({
          success: false,
          message: '필수 정보가 누락되었습니다.'
        });
      }

      const totalCost = parseFloat(amount) * parseFloat(price);
      const fee = totalCost * 0.005; // 0.5% 수수료
      const totalWithFee = totalCost + fee;

      // 트랜잭션 시작
      await database.query('START TRANSACTION');

      try {
        // 지갑 잔고 확인
        const wallet = await database.query(
          'SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE',
          [userId]
        );

        if (!wallet || wallet.length === 0 || wallet[0].balance < totalWithFee) {
          await database.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: '잔고가 부족합니다.',
            required: totalWithFee,
            available: wallet?.[0]?.balance || 0
          });
        }

        // 지갑에서 차감
        await database.query(
          'UPDATE user_wallets SET balance = balance - ? WHERE user_id = ?',
          [totalWithFee, userId]
        );

        // 기존 보유량 확인
        const existingHolding = await database.query(
          'SELECT total_amount, avg_price, total_invested FROM portfolio_holdings WHERE user_id = ? AND symbol = ?',
          [userId, symbol]
        );

        if (existingHolding && existingHolding.length > 0) {
          // 기존 보유 코인 업데이트 (평균 매입가 계산)
          const existing = existingHolding[0];
          const newTotalAmount = parseFloat(existing.total_amount) + parseFloat(amount);
          const newTotalInvested = parseFloat(existing.total_invested) + totalCost;
          const newAvgPrice = newTotalInvested / newTotalAmount;

          await database.query(`
            UPDATE portfolio_holdings 
            SET total_amount = ?, avg_price = ?, total_invested = ?, updated_at = NOW()
            WHERE user_id = ? AND symbol = ?
          `, [newTotalAmount, newAvgPrice, newTotalInvested, userId, symbol]);
        } else {
          // 새 코인 추가
          await database.query(`
            INSERT INTO portfolio_holdings (user_id, symbol, coin_name, total_amount, avg_price, total_invested)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [userId, symbol, coinName, amount, price, totalCost]);
        }

        // 거래 내역 추가
        await database.query(`
          INSERT INTO portfolio_transactions (user_id, symbol, coin_name, transaction_type, amount, price, total_value, fee)
          VALUES (?, ?, ?, 'buy', ?, ?, ?, ?)
        `, [userId, symbol, coinName, amount, price, totalCost, fee]);

        await database.query('COMMIT');

        res.json({
          success: true,
          message: '매수가 완료되었습니다.',
          data: {
            symbol: symbol,
            amount: parseFloat(amount),
            price: parseFloat(price),
            totalCost: totalCost,
            fee: fee,
            totalWithFee: totalWithFee
          }
        });
      } catch (error) {
        await database.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Buy coin error:', error);
      res.status(500).json({
        success: false,
        message: '매수 처리 중 오류가 발생했습니다.'
      });
    }
  }

  // 코인 매도
  async sellCoin(req, res) {
    try {
      const userId = req.user.id;
      const { symbol, amount, price } = req.body;

      if (!symbol || !amount || !price) {
        return res.status(400).json({
          success: false,
          message: '필수 정보가 누락되었습니다.'
        });
      }

      const sellAmount = parseFloat(amount);
      const sellPrice = parseFloat(price);
      const totalRevenue = sellAmount * sellPrice;
      const fee = totalRevenue * 0.005; // 0.5% 수수료
      const netRevenue = totalRevenue - fee;

      // 트랜잭션 시작
      await database.query('START TRANSACTION');

      try {
        // 보유량 확인
        const holding = await database.query(
          'SELECT total_amount, avg_price, total_invested, coin_name FROM portfolio_holdings WHERE user_id = ? AND symbol = ? FOR UPDATE',
          [userId, symbol]
        );

        if (!holding || holding.length === 0 || holding[0].total_amount < sellAmount) {
          await database.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: '보유량이 부족합니다.',
            required: sellAmount,
            available: holding?.[0]?.total_amount || 0
          });
        }

        const currentHolding = holding[0];
        const remainingAmount = parseFloat(currentHolding.total_amount) - sellAmount;
        
        // 비례적으로 투자금액 계산
        const soldInvestment = (sellAmount / parseFloat(currentHolding.total_amount)) * parseFloat(currentHolding.total_invested);
        const remainingInvestment = parseFloat(currentHolding.total_invested) - soldInvestment;

        if (remainingAmount <= 0) {
          // 전량 매도 - 레코드 삭제
          await database.query(
            'DELETE FROM portfolio_holdings WHERE user_id = ? AND symbol = ?',
            [userId, symbol]
          );
        } else {
          // 부분 매도 - 수량 및 투자금액 업데이트
          await database.query(`
            UPDATE portfolio_holdings 
            SET total_amount = ?, total_invested = ?, updated_at = NOW()
            WHERE user_id = ? AND symbol = ?
          `, [remainingAmount, remainingInvestment, userId, symbol]);
        }

        // 지갑에 수익금 추가
        await database.query(
          'UPDATE user_wallets SET balance = balance + ? WHERE user_id = ?',
          [netRevenue, userId]
        );

        // 거래 내역 추가
        await database.query(`
          INSERT INTO portfolio_transactions (user_id, symbol, coin_name, transaction_type, amount, price, total_value, fee)
          VALUES (?, ?, ?, 'sell', ?, ?, ?, ?)
        `, [userId, symbol, currentHolding.coin_name, sellAmount, sellPrice, totalRevenue, fee]);

        await database.query('COMMIT');

        res.json({
          success: true,
          message: '매도가 완료되었습니다.',
          data: {
            symbol: symbol,
            amount: sellAmount,
            price: sellPrice,
            totalRevenue: totalRevenue,
            fee: fee,
            netRevenue: netRevenue,
            profit: netRevenue - soldInvestment
          }
        });
      } catch (error) {
        await database.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Sell coin error:', error);
      res.status(500).json({
        success: false,
        message: '매도 처리 중 오류가 발생했습니다.'
      });
    }
  }

  // 거래 내역 조회
  async getTransactions(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const transactions = await database.query(`
        SELECT 
          symbol,
          coin_name,
          transaction_type,
          amount,
          price,
          total_value,
          fee,
          created_at
        FROM portfolio_transactions 
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, parseInt(limit), offset]);

      const totalCount = await database.query(
        'SELECT COUNT(*) as count FROM portfolio_transactions WHERE user_id = ?',
        [userId]
      );

      res.json({
        success: true,
        data: {
          transactions: transactions.map(tx => ({
            ...tx,
            amount: parseFloat(tx.amount),
            price: parseFloat(tx.price),
            total_value: parseFloat(tx.total_value),
            fee: parseFloat(tx.fee)
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount[0].count / parseInt(limit)),
            totalCount: totalCount[0].count
          }
        }
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: '거래 내역 조회 중 오류가 발생했습니다.'
      });
    }
  }

  // 코인 수동 추가 (포트폴리오 관리용)
  async addCoin(req, res) {
    try {
      const userId = req.user.id;
      const { symbol, coinName, amount, avgPrice } = req.body;

      if (!symbol || !coinName || !amount || !avgPrice) {
        return res.status(400).json({
          success: false,
          message: '모든 필드를 입력해주세요.'
        });
      }

      const totalInvested = parseFloat(amount) * parseFloat(avgPrice);

      // 기존 보유 확인
      const existingHolding = await database.query(
        'SELECT id FROM portfolio_holdings WHERE user_id = ? AND symbol = ?',
        [userId, symbol]
      );

      if (existingHolding && existingHolding.length > 0) {
        return res.status(400).json({
          success: false,
          message: '이미 보유 중인 코인입니다. 기존 보유량과 병합하려면 매수 기능을 사용하세요.'
        });
      }

      await database.query(`
        INSERT INTO portfolio_holdings (user_id, symbol, coin_name, total_amount, avg_price, total_invested)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userId, symbol.toUpperCase(), coinName, amount, avgPrice, totalInvested]);

      res.json({
        success: true,
        message: '코인이 포트폴리오에 추가되었습니다.',
        data: {
          symbol: symbol.toUpperCase(),
          coinName: coinName,
          amount: parseFloat(amount),
          avgPrice: parseFloat(avgPrice),
          totalInvested: totalInvested
        }
      });
    } catch (error) {
      console.error('Add coin error:', error);
      res.status(500).json({
        success: false,
        message: '코인 추가 중 오류가 발생했습니다.'
      });
    }
  }
}

module.exports = new PortfolioController();