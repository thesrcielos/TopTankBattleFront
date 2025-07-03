import { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Target, Users, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginUser, signup } from '@/api/UserApi';
import Cookies from 'js-cookie';
import { useUser } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { setToken } from '@/context/AuthContext';


const TopTankBattleAuth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const { checkAuth } = useUser();
  const handleAuthentication = () => {
    navigate("/rooms");
  };

  useEffect(() => {
    console.log(Cookies.get("token"));
    if (checkAuth()) {
      console.log("login authenticated");
      handleAuthentication();
    }
  }, [checkAuth]);
  
  const handleSubmit = async (isLogin: boolean) => {
    const data = isLogin ? loginData : registerData;
    
    if (!data.username.trim() || !data.password.trim()) {
      setAlert({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setAlert(null);
    
    let response;
    if (isLogin) {
      response = await loginUser(data);
      console.log(response);
    } else {
      response = await signup(data);
      console.log(response);
    }
    const token = response.token;
    setToken(token);
    if(checkAuth()) {
      handleAuthentication();
    }
  };

  const updateLoginData = (field, value) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const updateRegisterData = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 flex items-center justify-center p-4">

      <div className="relative w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Game branding and description */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex justify-center lg:justify-start">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-green-800 rounded-full shadow-2xl">
              <Target className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-7xl font-bold text-white tracking-wide leading-tight">
              TOP TANK<br />
              <span className="text-green-400">BATTLE</span>
            </h1>
            <p className="text-green-400 text-lg font-medium tracking-widest">
              FORTRESS DESTROYER
            </p>
            
            <div className="space-y-3 text-gray-300 text-lg max-w-lg">
              <p>⚡ Command your tank battalion</p>
              <p>🎯 Destroy enemy fortresses</p>
              <p>🏆 Dominate the battlefield</p>
              <p>🔥 Epic multiplayer combat</p>
            </div>
            
            <div className="pt-4 hidden lg:block">
              <p className="text-gray-400 text-sm">
                Join thousands of commanders in the ultimate tank warfare experience.
                <br />
                Prepare for the most epic battle of your gaming career!
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Authentication */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-black/40 backdrop-blur-lg border-green-500/20 shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-white font-bold tracking-wide">
                COMBAT ACCESS
              </CardTitle>
              <CardDescription className="text-center text-green-400">
                Enter your credentials to join the battle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 mb-6 h-12">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:bg-gray-600/50 font-semibold transition-all duration-300"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    LOGIN
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-gray-300 hover:bg-gray-600/50 font-semibold transition-all duration-300"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    REGISTER
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="text-green-400 font-semibold tracking-wide">
                      USERNAME
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-username"
                        type="text"
                        value={loginData.username}
                        onChange={(e) => updateLoginData('username', e.target.value)}
                        placeholder="Enter your username"
                        className="bg-gray-900/50 border-green-500/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 transition-all duration-300"
                      />
                      <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-green-400 font-semibold tracking-wide">
                      PASSWORD
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => updateLoginData('password', e.target.value)}
                        placeholder="Enter your password"
                        className="bg-gray-900/50 border-green-500/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 transition-all duration-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-green-500 hover:text-green-400"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-6 text-lg tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        PROCESSING...
                      </div>
                    ) : (
                      'ENTER COMBAT'
                    )}
                  </Button>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-green-400 font-semibold tracking-wide">
                      USERNAME
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-username"
                        type="text"
                        value={registerData.username}
                        onChange={(e) => updateRegisterData('username', e.target.value)}
                        placeholder="Choose your username"
                        className="bg-gray-900/50 border-green-500/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 transition-all duration-300"
                      />
                      <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-green-400 font-semibold tracking-wide">
                      PASSWORD
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        value={registerData.password}
                        onChange={(e) => updateRegisterData('password', e.target.value)}
                        placeholder="Create your password"
                        className="bg-gray-900/50 border-green-500/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 transition-all duration-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-green-500 hover:text-green-400"
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-6 text-lg tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        PROCESSING...
                      </div>
                    ) : (
                      'JOIN BATTLE'
                    )}
                  </Button>
                </TabsContent>
              </Tabs>

              {/* Alert Messages */}
              {alert && (
                <Alert className={`mt-4 ${alert.type === 'success' ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                  <AlertDescription className={alert.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                    {alert.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TopTankBattleAuth;