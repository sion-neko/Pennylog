const API_BASE_URL = 'http://localhost:8080/api';

class ExpenseTracker {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategories();
        this.loadExpenses();
        this.setTodayDate();
    }

    setupEventListeners() {
        // タブ切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // 収支登録フォーム
        document.getElementById('expense-form').addEventListener('submit', (e) => this.handleExpenseSubmit(e));

        // カテゴリ追加フォーム
        document.getElementById('category-form').addEventListener('submit', (e) => this.handleCategorySubmit(e));
    }

    switchTab(tabName) {
        // タブボタンの状態更新
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // タブコンテンツの表示切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // ダッシュボードタブの場合はデータを再読み込み
        if (tabName === 'dashboard') {
            this.updateDashboard();
        }
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    async loadCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            const categories = await response.json();
            this.populateCategories(categories);
            this.displayCategories(categories);
        } catch (error) {
            console.error('カテゴリの読み込みに失敗:', error);
        }
    }

    populateCategories(categories) {
        const select = document.getElementById('category');
        select.innerHTML = '<option value="">カテゴリを選択</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    displayCategories(categories) {
        const container = document.getElementById('categories-container');
        container.innerHTML = '';

        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.innerHTML = `
                <div class="category-name">
                    <div class="category-color" style="background-color: ${category.color}"></div>
                    ${category.name}
                </div>
                <button class="delete-btn" onclick="expenseTracker.deleteCategory(${category.id})">削除</button>
            `;
            container.appendChild(categoryElement);
        });
    }

    async loadExpenses() {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`);
            const expenses = await response.json();
            this.displayRecentExpenses(expenses.slice(-10).reverse());
            this.updateDashboard();
        } catch (error) {
            console.error('収支データの読み込みに失敗:', error);
        }
    }

    displayRecentExpenses(expenses) {
        const container = document.getElementById('recent-expenses');
        container.innerHTML = '';

        if (expenses.length === 0) {
            container.innerHTML = '<p>取引履歴がありません</p>';
            return;
        }

        expenses.forEach(expense => {
            const expenseElement = document.createElement('div');
            expenseElement.className = 'expense-item';
            
            const categoryColor = expense.category ? expense.category.color : '#999999';
            const categoryName = expense.category ? expense.category.name : '未分類';
            const amountClass = expense.type === 'INCOME' ? 'income' : 'expense';
            const amountPrefix = expense.type === 'INCOME' ? '+' : '-';
            
            expenseElement.innerHTML = `
                <div class="expense-info">
                    <div class="category-color" style="background-color: ${categoryColor}"></div>
                    <div>
                        <div>${expense.description || categoryName}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">${expense.date}</div>
                    </div>
                </div>
                <div class="expense-amount ${amountClass}">
                    ${amountPrefix}¥${Number(expense.amount).toLocaleString()}
                </div>
            `;
            container.appendChild(expenseElement);
        });
    }

    async updateDashboard() {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            
            const response = await fetch(`${API_BASE_URL}/expenses/month/${year}/${month}`);
            const monthlyExpenses = await response.json();
            
            let totalIncome = 0;
            let totalExpense = 0;
            
            monthlyExpenses.forEach(expense => {
                if (expense.type === 'INCOME') {
                    totalIncome += Number(expense.amount);
                } else {
                    totalExpense += Number(expense.amount);
                }
            });
            
            document.getElementById('total-income').textContent = `¥${totalIncome.toLocaleString()}`;
            document.getElementById('total-expense').textContent = `¥${totalExpense.toLocaleString()}`;
            document.getElementById('balance').textContent = `¥${(totalIncome - totalExpense).toLocaleString()}`;
            
        } catch (error) {
            console.error('ダッシュボードの更新に失敗:', error);
        }
    }

    async handleExpenseSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const expenseData = {
            amount: parseFloat(document.getElementById('amount').value),
            description: document.getElementById('description').value,
            date: document.getElementById('date').value,
            type: document.getElementById('type').value,
            category: { id: parseInt(document.getElementById('category').value) }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData)
            });

            if (response.ok) {
                alert('収支を登録しました！');
                e.target.reset();
                this.setTodayDate();
                this.loadExpenses();
            } else {
                alert('登録に失敗しました');
            }
        } catch (error) {
            console.error('収支登録エラー:', error);
            alert('登録に失敗しました');
        }
    }

    async handleCategorySubmit(e) {
        e.preventDefault();
        
        const categoryData = {
            name: document.getElementById('category-name').value,
            color: document.getElementById('category-color').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData)
            });

            if (response.ok) {
                alert('カテゴリを追加しました！');
                e.target.reset();
                this.loadCategories();
            } else {
                alert('追加に失敗しました');
            }
        } catch (error) {
            console.error('カテゴリ追加エラー:', error);
            alert('追加に失敗しました');
        }
    }

    async deleteCategory(categoryId) {
        if (!confirm('このカテゴリを削除しますか？')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('カテゴリを削除しました');
                this.loadCategories();
            } else {
                alert('削除に失敗しました');
            }
        } catch (error) {
            console.error('カテゴリ削除エラー:', error);
            alert('削除に失敗しました');
        }
    }
}

// アプリケーション初期化
const expenseTracker = new ExpenseTracker();