import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pill, User, Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { login, getStoredUser } from '@/lib/api';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmittingMr, setIsSubmittingMr] = useState(false);
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [showMRPassword, setShowMRPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  
  const [mrCredentials, setMRCredentials] = useState({ username: '', password: '' });
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });

  useEffect(() => {
    const user = getStoredUser();
    if (user?.role === 'MR') {
      navigate('/mr/dashboard');
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleMRLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mrCredentials.username || !mrCredentials.password) {
      toast({
        title: 'Missing credentials',
        description: 'Please enter both username and password.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmittingMr(true);
      await login('MR', mrCredentials);
      toast({
        title: 'Login successful',
        description: 'Welcome back, MR!',
      });
      navigate('/mr/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingMr(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCredentials.username || !adminCredentials.password) {
      toast({
        title: 'Missing credentials',
        description: 'Please enter both username and password.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmittingAdmin(true);
      await login('admin', adminCredentials);
      toast({
        title: 'Login successful',
        description: 'Welcome back, Admin!',
      });
      navigate('/admin/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Riddhi Life Sciences MR Visit Tracker</title>
        <meta name="description" content="Login to Riddhi Life Sciences MR Visit Tracker. Access your MR dashboard or admin control panel." />
      </Helmet>
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <header className="p-4 lg:p-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-pharma-lg">
                  <Pill className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Riddhi Life Sciences</h1>
              <p className="text-muted-foreground mt-1">MR Visit Tracker</p>
            </div>

            <div className="space-y-6">
              <div className="pharma-card p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">MR Login</h2>
                    <p className="text-sm text-muted-foreground">For Medical Representatives</p>
                  </div>
                </div>

                <form onSubmit={handleMRLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="mr-username" className="text-sm font-medium">
                      Username
                    </Label>
                    <Input
                      id="mr-username"
                      type="text"
                      placeholder="Enter your username"
                      value={mrCredentials.username}
                      onChange={(e) => setMRCredentials({ ...mrCredentials, username: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mr-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="mr-password"
                        type={showMRPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={mrCredentials.password}
                        onChange={(e) => setMRCredentials({ ...mrCredentials, password: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMRPassword(!showMRPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showMRPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={isSubmittingMr}>
                    {isSubmittingMr ? 'Signing in...' : 'Login as MR'}
                  </Button>
                </form>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-muted/30 px-4 text-sm text-muted-foreground">or</span>
                </div>
              </div>

              <div className="pharma-card p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Admin Login</h2>
                    <p className="text-sm text-muted-foreground">For Administrators</p>
                  </div>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="admin-username" className="text-sm font-medium">
                      Username
                    </Label>
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="Enter your username"
                      value={adminCredentials.username}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="admin-password"
                        type={showAdminPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={adminCredentials.password}
                        onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" variant="success" className="w-full" disabled={isSubmittingAdmin}>
                    {isSubmittingAdmin ? 'Signing in...' : 'Login as Admin'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <footer className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Riddhi Life Sciences. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
