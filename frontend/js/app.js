const API_BASE_URL = 'http://localhost:8080/api';

class ExpenseTracker {
    constructor() {
        this.currentEditingExpenseId = null;
        this.selectedMonth = new Date().getMonth() + 1;
        this.selectedYear = new Date().getFullYear();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategories();
        this.setupMonthSelector();
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

        // 編集フォーム
        document.getElementById('edit-expense-form').addEventListener('submit', (e) => this.handleEditSubmit(e));

        // モーダル関連
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.querySelector('.cancel-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('edit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-modal') this.closeModal();
        });

        // 月選択
        document.getElementById('month-year').addEventListener('change', (e) => {
            const [year, month] = e.target.value.split('-').map(Number);
            this.selectedYear = year;
            this.selectedMonth = month;
            this.updateDashboard();
            this.loadMonthTransactions();
        });
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
            this.loadMonthTransactions();
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
        const editSelect = document.getElementById('edit-category');
        
        [select, editSelect].forEach(sel => {
            sel.innerHTML = '<option value="">カテゴリを選択</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                sel.appendChild(option);
            });
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
                <div style="display: flex; align-items: center;">
                    <div class="expense-amount ${amountClass}">
                        ${amountPrefix}¥${Number(expense.amount).toLocaleString()}
                    </div>
                    <div class="expense-actions">
                        <button class="edit-btn" onclick="expenseTracker.editExpense(${expense.id})">編集</button>
                        <button class="delete-expense-btn" onclick="expenseTracker.deleteExpense(${expense.id})">削除</button>
                    </div>
                </div>
            `;
            container.appendChild(expenseElement);
        });
    }

    async updateDashboard() {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/month/${this.selectedYear}/${this.selectedMonth}`);
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
            
            // 月表示を更新
            const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
            const monthDisplay = `${this.selectedYear}年${monthNames[this.selectedMonth - 1]}`;
            
            document.getElementById('summary-period').textContent = `${monthDisplay}の収入`;
            document.getElementById('summary-period-expense').textContent = `${monthDisplay}の支出`;
            document.getElementById('month-transactions-title').textContent = `${monthDisplay}の取引一覧`;
            
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

    setupMonthSelector() {
        const selector = document.getElementById('month-year');
        const currentDate = new Date();
        
        // 過去12ヶ月分を生成
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            
            const option = document.createElement('option');
            option.value = `${year}-${month}`;
            option.textContent = `${year}年${month}月`;
            
            if (i === 0) {
                option.selected = true;
            }
            
            selector.appendChild(option);
        }
    }

    async editExpense(expenseId) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`);
            const expense = await response.json();
            
            this.currentEditingExpenseId = expenseId;
            
            // フォームに値を設定
            document.getElementById('edit-type').value = expense.type;
            document.getElementById('edit-amount').value = expense.amount;
            document.getElementById('edit-description').value = expense.description || '';
            document.getElementById('edit-category').value = expense.category ? expense.category.id : '';
            document.getElementById('edit-date').value = expense.date;
            
            // モーダルを表示
            document.getElementById('edit-modal').style.display = 'block';
            
        } catch (error) {
            console.error('編集データの取得に失敗:', error);
            alert('編集データの取得に失敗しました');
        }
    }

    async deleteExpense(expenseId) {
        if (!confirm('この取引を削除しますか？')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('取引を削除しました');
                this.loadExpenses();
                this.updateDashboard();
                this.loadMonthTransactions();
            } else {
                alert('削除に失敗しました');
            }
        } catch (error) {
            console.error('取引削除エラー:', error);
            alert('削除に失敗しました');
        }
    }

    async handleEditSubmit(e) {
        e.preventDefault();
        
        const expenseData = {
            amount: parseFloat(document.getElementById('edit-amount').value),
            description: document.getElementById('edit-description').value,
            date: document.getElementById('edit-date').value,
            type: document.getElementById('edit-type').value,
            category: { id: parseInt(document.getElementById('edit-category').value) }
        };

        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${this.currentEditingExpenseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData)
            });

            if (response.ok) {
                alert('取引を更新しました！');
                this.closeModal();
                this.loadExpenses();
                this.updateDashboard();
                this.loadMonthTransactions();
            } else {
                alert('更新に失敗しました');
            }
        } catch (error) {
            console.error('取引更新エラー:', error);
            alert('更新に失敗しました');
        }
    }

    closeModal() {
        document.getElementById('edit-modal').style.display = 'none';
        this.currentEditingExpenseId = null;
    }

    async loadMonthTransactions() {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/month/${this.selectedYear}/${this.selectedMonth}`);
            const monthlyExpenses = await response.json();
            this.displayMonthTransactions(monthlyExpenses);
        } catch (error) {
            console.error('月の取引データの読み込みに失敗:', error);
        }
    }

    displayMonthTransactions(expenses) {
        const container = document.getElementById('month-transactions-list');
        container.innerHTML = '';

        if (expenses.length === 0) {
            container.innerHTML = '<p>この月の取引履歴がありません</p>';
            return;
        }

        // 日付でソート（新しい順）
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

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
                <div style="display: flex; align-items: center;">
                    <div class="expense-amount ${amountClass}">
                        ${amountPrefix}¥${Number(expense.amount).toLocaleString()}
                    </div>
                    <div class="expense-actions">
                        <button class="edit-btn" onclick="expenseTracker.editExpense(${expense.id})">編集</button>
                        <button class="delete-expense-btn" onclick="expenseTracker.deleteExpense(${expense.id})">削除</button>
                    </div>
                </div>
            `;
            container.appendChild(expenseElement);
        });
    }
}

// アプリケーション初期化
const expenseTracker = new ExpenseTracker();