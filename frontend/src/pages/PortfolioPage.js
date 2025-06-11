      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>내 포트폴리오</h2>
        <div className="d-flex gap-2">
          <Link to="/coins" className="btn btn-outline-primary">코인 목록</Link>
          <Link to="/trade/BTC" className="btn btn-success">거래하기</Link>
        </div>
      </div>

      {/* 포트폴리오 요약 */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5>총 자산</h5>
              <h3 className="text-primary">${getTotalValue().toFixed(2)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5>총 수익/손실</h5>
              <h3 className={getTotalProfit() >= 0 ? 'text-success' : 'text-danger'}>
                {getTotalProfit() >= 0 ? '+' : ''}${getTotalProfit().toFixed(2)}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5>수익률</h5>
              <h3 className={getTotalProfit() >= 0 ? 'text-success' : 'text-danger'}>
                {getTotalProfit() >= 0 ? '+' : ''}{getProfitPercentage()}%
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5>보유 코인</h5>
              <h3>{portfolioData.filter(item => item.symbol !== 'USD').length}개</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          {/* 포트폴리오 상세 */}
          <Card className="mb-4">
            <Card.Header>
              <h5>보유 자산</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>자산</th>
                    <th className="text-end">수량</th>
                    <th className="text-end">현재 가격</th>
                    <th className="text-end">총 가치</th>
                    <th className="text-end">비율</th>
                    <th className="text-center">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.map((item, index) => (
                    <tr key={item.symbol}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {item.symbol === 'USD' ? '💵' : 
                             item.symbol === 'BTC' ? '₿' :
                             item.symbol === 'ETH' ? 'Ξ' :
                             item.symbol === 'ADA' ? '₳' :
                             item.symbol === 'SOL' ? '◎' :
                             item.symbol === 'XRP' ? '✕' : '🪙'}
                          </div>
                          <div>
                            <div className="fw-bold">{item.name}</div>
                            <small className="text-muted">{item.symbol}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-end">
                        {item.symbol === 'USD' ? '-' : item.quantity.toFixed(8)}
                      </td>
                      <td className="text-end">
                        {item.symbol === 'USD' ? '-' : `$${item.currentPrice.toLocaleString()}`}
                      </td>
                      <td className="text-end fw-bold">
                        ${item.value.toFixed(2)}
                      </td>
                      <td className="text-end">
                        <Badge bg="secondary">{item.percentage}%</Badge>
                      </td>
                      <td className="text-center">
                        {item.symbol !== 'USD' ? (
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              as={Link}
                              to={`/coin/${item.symbol}`}
                              variant="outline-primary"
                              size="sm"
                            >
                              보기
                            </Button>
                            <Button
                              as={Link}
                              to={`/trade/${item.symbol}`}
                              variant="outline-success"
                              size="sm"
                            >
                              거래
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* 성과 차트 */}
          <Card>
            <Card.Header>
              <h5>포트폴리오 성과 (7일)</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'value' ? `$${value.toLocaleString()}` : `$${value}`,
                      name === 'value' ? '포트폴리오 가치' : '수익/손실'
                    ]}
                  />
                  <Bar dataKey="value" fill="#007bff" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* 자산 배분 파이 차트 */}
          <Card className="mb-4">
            <Card.Header>
              <h5>자산 배분</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({symbol, percentage}) => `${symbol} ${percentage}%`}
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '가치']} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          {/* 최근 거래 내역 */}
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">최근 거래</h5>
                <small>{transactions.length}건</small>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {transactions.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="border-bottom p-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center">
                          <Badge 
                            bg={tx.type === 'buy' ? 'success' : 'danger'}
                            className="me-2"
                          >
                            {tx.type === 'buy' ? '매수' : '매도'}
                          </Badge>
                          <strong>{tx.symbol}</strong>
                        </div>
                        <small className="text-muted">
                          {new Date(tx.date).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="d-flex justify-content-between text-sm">
                        <span>{tx.quantity.toFixed(4)} {tx.symbol}</span>
                        <span>${tx.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted p-4">
                  아직 거래 내역이 없습니다.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PortfolioPage;