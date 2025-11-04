/**
 * High-Quality Component Templates
 * These serve as reference examples for the AI to match in quality
 */

export const COMPONENT_TEMPLATES = {

  dashboard: `'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, DollarSign, Activity, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      label: 'Total Revenue',
      value: '$45,231',
      icon: DollarSign,
      change: '+20.1%',
      trend: 'up'
    },
    {
      label: 'Active Users',
      value: '2,350',
      icon: Users,
      change: '+15.3%',
      trend: 'up'
    },
    {
      label: 'Conversion Rate',
      value: '12.5%',
      icon: Activity,
      change: '+2.5%',
      trend: 'up'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Welcome back! Here's what's happening today.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-slate-300 transition-all duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  <p className="text-xs text-emerald-600 font-medium">
                    {stat.change} from last month
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}`,

  form: `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function BeautifulForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-slate-200">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
          </div>
          <CardDescription className="text-slate-600">
            Enter your credentials to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="transition-all duration-200 focus:ring-2 focus:ring-violet-500 border-slate-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="transition-all duration-200 focus:ring-2 focus:ring-violet-500 border-slate-200"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}`,

  list: `'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, MoreVertical, CheckCircle2, Clock } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending';
  date: string;
}

export default function ItemList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [items] = useState<Item[]>([
    {
      id: '1',
      title: 'Design new dashboard',
      description: 'Create modern analytics dashboard with charts',
      status: 'completed',
      date: '2024-01-15',
    },
    {
      id: '2',
      title: 'Implement authentication',
      description: 'Add OAuth and JWT-based auth system',
      status: 'pending',
      date: '2024-01-16',
    },
  ]);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Items</h1>
            <p className="text-slate-600 mt-1">{items.length} total items</p>
          </div>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-200 focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-slate-300 transition-all duration-200 cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                      <p className="text-xs text-slate-500 mt-2">{item.date}</p>
                    </div>
                  </div>

                  <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}`,

  'data-table': `'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Filter } from 'lucide-react';

interface TableRow {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  date: string;
}

export default function DataTable() {
  const [data] = useState<TableRow[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', date: '2024-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active', date: '2024-01-14' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Data Table</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-200">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="border-slate-200">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <div className="p-4 border-b border-slate-200">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 border-slate-200"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{row.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{row.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={\`inline-flex px-2 py-1 text-xs font-semibold rounded-full \${
                        row.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }\`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}`,

};

export function getTemplateForComponent(componentName: string, componentType: string): string | null {
  const name = componentName.toLowerCase();

  if (name.includes('dashboard')) return COMPONENT_TEMPLATES.dashboard;
  if (name.includes('form') || name.includes('login') || name.includes('signup')) return COMPONENT_TEMPLATES.form;
  if (name.includes('list') || name.includes('feed')) return COMPONENT_TEMPLATES.list;
  if (name.includes('table') || name.includes('data')) return COMPONENT_TEMPLATES['data-table'];

  // Default to list for frontend components
  if (componentType === 'frontend') return COMPONENT_TEMPLATES.list;

  return null;
}
