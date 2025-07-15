import React from "react";
import { Container, Row, Col, Button, Card, CardBody, CardTitle, CardText } from "react-bootstrap";

export default function overViewPage() {
  return (
    <>
      <Container>
        {/* ヒーローセクション */}
        <Row className="align-items-center mb-4">
          <Col md={12}>
            <h3>簡単に、自由にフォームを作成しよう</h3>
            <p className="lead">Googleフォームのように直感的で美しいフォームを、カスタマイズ自由に作成できます。</p>
            <Button href="#start" variant="primary" size="lg">今すぐ始める</Button>
          </Col>
          <Col md={6}>
            
          </Col>
        </Row>

        {/* 特徴セクション */}
        <h2 id="features" className="mb-4 text-center">特徴</h2>
        <Row className="mb-5">
          <Col md={4}>
            <Card className="h-100 text-center">
              <CardBody>
                <CardTitle>ドラッグ＆ドロップ</CardTitle>
                <CardText>直感的に操作できるドラッグ＆ドロップでフォーム項目を自由に追加・編集。</CardText>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center">
              <CardBody>
                <CardTitle>豊富な質問タイプ</CardTitle>
                <CardText>テキスト入力、選択肢、評価など多彩な質問タイプを用意。</CardText>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center">
              <CardBody>
                <CardTitle>リアルタイム集計</CardTitle>
                <CardText>回答データはリアルタイムで集計表示でき、分析も簡単。</CardText>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* スタートセクション */}
        <div id="start" className="text-center mb-5">
          <h3>さあ、あなたもフォーム作成を始めましょう！</h3>
          <Button href="/login" variant="success" size="lg">フォームを作成する</Button>
        </div>
      </Container>
    </>
  );
}
