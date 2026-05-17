import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, ArrowRightCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { paymentAPI } from '../../services/api';

export const PaymentsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('deposit');
  const token = localStorage.getItem('business_nexus_token') || '';

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await paymentAPI.getTransactions(token);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleTransaction = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      if (activeTab === 'deposit') {
        await paymentAPI.deposit(token, Number(amount), description);
      } else if (activeTab === 'withdraw') {
        await paymentAPI.withdraw(token, Number(amount), description);
      } else {
        await paymentAPI.deposit(token, Number(amount), description);
      }
      setAmount('');
      setDescription('');
      await fetchTransactions();
    } catch (err) {
      console.error('Error processing transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalDeposits - totalWithdrawals;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Manage your transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">${balance.toFixed(2)}</p>
              </div>
              <DollarSign size={32} className="text-primary-600" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold text-green-600">${totalDeposits.toFixed(2)}</p>
              </div>
              <ArrowUpCircle size={32} className="text-green-600" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-600">${totalWithdrawals.toFixed(2)}</p>
              </div>
              <ArrowDownCircle size={32} className="text-red-600" />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">New Transaction</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('deposit')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                  activeTab === 'deposit'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                  activeTab === 'withdraw'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Withdraw
              </button>
              <button
                onClick={() => setActiveTab('transfer')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                  activeTab === 'transfer'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Transfer
              </button>
            </div>

            <Input
              label="Amount ($)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              fullWidth
            />

            <Input
              label="Description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              fullWidth
            />

            <Button
              fullWidth
              isLoading={loading}
              onClick={handleTransaction}
            >
              {activeTab === 'deposit'
                ? 'Deposit'
                : activeTab === 'withdraw'
                ? 'Withdraw'
                : 'Transfer'}
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
          </CardHeader>
          <CardBody>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction: any) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === 'deposit' ? (
                        <ArrowUpCircle size={20} className="text-green-600" />
                      ) : transaction.type === 'withdrawal' ? (
                        <ArrowDownCircle size={20} className="text-red-600" />
                      ) : (
                        <ArrowRightCircle size={20} className="text-blue-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        transaction.type === 'deposit'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}
                        ${transaction.amount}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};