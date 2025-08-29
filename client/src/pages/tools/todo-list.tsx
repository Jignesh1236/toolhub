import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, CheckCircle2, Circle, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
  dueDate?: Date;
}

export default function TodoList() {
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTodoCategory, setNewTodoCategory] = useState("general");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = ["general", "work", "personal", "shopping", "health", "finance"];
  const priorities = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'red' }
  ];

  // Load todos from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem('todo-list-todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos);
      const todosWithDates = parsedTodos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      }));
      setTodos(todosWithDates);
    }
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem('todo-list-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodoText.trim()) {
      toast({
        title: "Task required",
        description: "Please enter a task description",
        variant: "destructive"
      });
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      priority: newTodoPriority,
      category: newTodoCategory,
      createdAt: new Date()
    };

    setTodos(prev => [newTodo, ...prev]);
    setNewTodoText("");
    
    toast({
      title: "Task added",
      description: "Your task has been added to the list"
    });
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    toast({
      title: "Task deleted",
      description: "The task has been removed from your list"
    });
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
    toast({
      title: "Completed tasks cleared",
      description: "All completed tasks have been removed"
    });
  };

  const getFilteredTodos = (completed?: boolean) => {
    return todos.filter(todo => {
      const matchesCompletion = completed === undefined || todo.completed === completed;
      const matchesPriority = filterPriority === "all" || todo.priority === filterPriority;
      const matchesCategory = filterCategory === "all" || todo.category === filterCategory;
      
      return matchesCompletion && matchesPriority && matchesCategory;
    });
  };

  const getStats = () => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    const high = todos.filter(t => !t.completed && t.priority === 'high').length;
    
    return { total, completed, pending, high };
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const stats = getStats();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Todo List</h1>
        <p className="text-muted-foreground">
          Manage your tasks and track your productivity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold" data-testid="stat-total">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600" data-testid="stat-pending">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600" data-testid="stat-completed">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600" data-testid="stat-high-priority">{stats.high}</div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Todo */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
            <CardDescription>
              Create a new task with priority and category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter your task..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              data-testid="input-new-todo"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={newTodoPriority} onValueChange={(value: any) => setNewTodoPriority(value)}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={newTodoCategory} onValueChange={setNewTodoCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={addTodo} className="w-full" data-testid="button-add-todo">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </CardContent>
        </Card>

        {/* Todo List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tasks</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearCompleted} data-testid="button-clear-completed">
                  Clear Completed
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All ({getFilteredTodos().length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({getFilteredTodos(false).length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({getFilteredTodos(true).length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-2 max-h-96 overflow-y-auto">
                {getFilteredTodos().map((todo) => (
                  <TodoItem 
                    key={todo.id} 
                    todo={todo} 
                    onToggle={toggleTodo} 
                    onDelete={deleteTodo}
                    getPriorityBadgeVariant={getPriorityBadgeVariant}
                  />
                ))}
                {getFilteredTodos().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No tasks found</div>
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-2 max-h-96 overflow-y-auto">
                {getFilteredTodos(false).map((todo) => (
                  <TodoItem 
                    key={todo.id} 
                    todo={todo} 
                    onToggle={toggleTodo} 
                    onDelete={deleteTodo}
                    getPriorityBadgeVariant={getPriorityBadgeVariant}
                  />
                ))}
                {getFilteredTodos(false).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No pending tasks</div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-2 max-h-96 overflow-y-auto">
                {getFilteredTodos(true).map((todo) => (
                  <TodoItem 
                    key={todo.id} 
                    todo={todo} 
                    onToggle={toggleTodo} 
                    onDelete={deleteTodo}
                    getPriorityBadgeVariant={getPriorityBadgeVariant}
                  />
                ))}
                {getFilteredTodos(true).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No completed tasks</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  getPriorityBadgeVariant: (priority: string) => any;
}

function TodoItem({ todo, onToggle, onDelete, getPriorityBadgeVariant }: TodoItemProps) {
  return (
    <div className={`flex items-center gap-3 p-3 border rounded-lg ${todo.completed ? 'bg-muted/30' : 'bg-background'}`}>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        data-testid={`checkbox-${todo.id}`}
      />
      
      <div className="flex-1 min-w-0">
        <div className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
          {todo.text}
        </div>
        <div className="flex gap-2 mt-1">
          <Badge variant={getPriorityBadgeVariant(todo.priority)} className="text-xs">
            {todo.priority}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {todo.category}
          </Badge>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(todo.id)}
        data-testid={`button-delete-${todo.id}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}