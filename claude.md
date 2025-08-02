# 家計簿アプリ

Spring Boot + JavaScript で構築された個人向け家計簿管理アプリケーションです。

## 概要

このアプリケーションは収入と支出を管理し、カテゴリ別に分類して月次の収支を確認できる家計簿アプリです。

## 技術構成

### バックエンド
- **フレームワーク**: Spring Boot 3.2.0
- **言語**: Java 17
- **データベース**: H2 (インメモリ)
- **ORM**: JPA/Hibernate
- **ビルドツール**: Maven

### フロントエンド
- **言語**: JavaScript (バニラ)
- **スタイル**: CSS3
- **UI**: レスポンシブデザイン

## 機能

### 基本機能
- 収支の登録（収入・支出）
- カテゴリ管理（色付きカテゴリ）
- 月次収支サマリー表示
- 取引履歴一覧表示

### API エンドポイント

#### 収支管理
- `GET /api/expenses` - 全ての収支取得
- `GET /api/expenses/{id}` - 特定の収支取得
- `GET /api/expenses/month/{year}/{month}` - 月次収支取得
- `GET /api/expenses/range?startDate={date}&endDate={date}` - 期間別収支取得
- `POST /api/expenses` - 収支登録
- `PUT /api/expenses/{id}` - 収支更新
- `DELETE /api/expenses/{id}` - 収支削除

#### カテゴリ管理
- `GET /api/categories` - 全てのカテゴリ取得
- `POST /api/categories` - カテゴリ追加
- `DELETE /api/categories/{id}` - カテゴリ削除

## データモデル

### Expense (収支)
```java
- id: Long (主キー)
- amount: BigDecimal (金額)
- description: String (説明)
- date: LocalDate (日付)
- category: Category (カテゴリ)
- type: ExpenseType (収入/支出の種別)
```

### Category (カテゴリ)
```java
- id: Long (主キー)
- name: String (カテゴリ名)
- color: String (表示色)
```

## セットアップ

### 前提条件
- Java 17以上
- Maven 3.6以上

### 起動手順

1. **バックエンドの起動**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   - サーバーは http://localhost:8080 で起動

2. **フロントエンドの表示**
   - `frontend/index.html` をブラウザで開く
   - または静的サーバーで配信

### デフォルトデータ

初期状態で以下のカテゴリが登録されています：
- 食費 (#FF6B6B)
- 交通費 (#4ECDC4)
- 娯楽 (#45B7D1)
- 生活用品 (#96CEB4)
- 医療 (#FFEAA7)
- 給与 (#74B9FF)

## 使用方法

### 収支の登録
1. 「収支登録」タブを選択
2. 種別（収入/支出）を選択
3. 金額、説明、カテゴリ、日付を入力
4. 「登録」ボタンをクリック

### カテゴリの管理
1. 「カテゴリ管理」タブを選択
2. カテゴリ名と色を入力
3. 「追加」ボタンをクリック
4. 削除は各カテゴリの「削除」ボタンをクリック

### ダッシュボードの確認
- 「ダッシュボード」タブで月次サマリーと最近の取引を確認

## 開発情報

### データベース管理
- H2コンソール: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:expensedb`
- ユーザー名: `sa`
- パスワード: (空白)

### ログ設定
- アプリケーションログレベル: DEBUG
- SQL表示: 有効

### CORS設定
- フロントエンドからのアクセスを許可するため `@CrossOrigin(origins = "*")` を設定