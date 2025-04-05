import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Flame,
  Droplets,
  CloudLightning,
  Waves,
  BarChart,
  RefreshCw,
  Send,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { processPredictionChatMessage } from '@/lib/aiUtils';

export default function Predictions() {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'system',
      content: 'Hello! I\'m an AI assistant specialized in disaster prediction analysis. I can help you understand our disaster predictions, analyze risk factors, and provide insights into mitigation strategies. How can I assist you today?'
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch prediction data
  const { data: predictions = [], isLoading: predictionsLoading } = useQuery({
    queryKey: ['/api/predictions'],
  });

  // Function to send message to AI chat
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isSubmitting) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsSubmitting(true);
    
    try {
      // Get response using the aiUtils function
      const aiResponse = await processPredictionChatMessage(userMessage.content, chatMessages);
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in AI chat:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request. Please try again later.' 
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get icon based on disaster type
  const getDisasterIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'fire':
        return <Flame className="h-5 w-5 text-red-500" />;
      case 'flood':
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'earthquake':
        return <Waves className="h-5 w-5 text-orange-500" />;
      case 'storm':
        return <CloudLightning className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Get color based on probability
  const getProbabilityColor = (probability) => {
    const prob = parseFloat(probability);
    if (prob >= 0.7) return "text-red-500";
    if (prob >= 0.5) return "text-orange-500";
    return "text-yellow-500";
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disaster Predictions</h1>
          <p className="text-gray-500 mt-2">
            AI-powered analysis and prediction of potential disaster events
          </p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions List */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg">Active Predictions</CardTitle>
              <CardDescription>Ordered by probability</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {predictionsLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading predictions...</p>
                </div>
              ) : predictions.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No active predictions found.</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {predictions.map((prediction) => (
                    <li key={prediction.id} className="p-4 hover:bg-muted/50 transition cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getDisasterIcon(prediction.disasterType)}
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center">
                            {prediction.disasterType.charAt(0).toUpperCase() + prediction.disasterType.slice(1)} 
                            <Badge className="ml-2" variant="outline">
                              <span className={getProbabilityColor(prediction.probability)}>
                                {Math.round(prediction.probability * 100)}%
                              </span>
                            </Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground">{prediction.location}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> {prediction.timeFrame}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" /> {formatDate(prediction.createdAt, { dateStyle: 'short' })}
                            </span>
                          </div>
                          {prediction.description && (
                            <p className="mt-2 text-sm">{prediction.description}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prediction Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Wildfire Predictions</span>
                    <span className="text-sm font-medium">87%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Flood Predictions</span>
                    <span className="text-sm font-medium">82%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Storm Predictions</span>
                    <span className="text-sm font-medium">91%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: '91%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Earthquake Predictions</span>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t text-xs text-muted-foreground">
              Based on historical prediction data from the last 12 months
            </CardFooter>
          </Card>
        </div>

        {/* AI Chat Interface */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden h-[600px] flex flex-col">
            <CardHeader className="bg-muted/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">AI Prediction Assistant</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs px-2 py-0">
                  Beta
                </Badge>
              </div>
              <CardDescription>
                Ask questions about disaster predictions and get AI-powered insights
              </CardDescription>
            </CardHeader>
            
            {/* Chat Messages */}
            <CardContent className="p-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                {chatMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.role === 'user' ? (
                          <>
                            <User className="h-4 w-4" />
                            <span className="text-xs font-semibold">You</span>
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4" />
                            <span className="text-xs font-semibold">AI Assistant</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isSubmitting && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4" />
                        <span className="text-xs font-semibold">AI Assistant</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-150"></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            {/* Chat Input */}
            <CardFooter className="p-4 border-t bg-card">
              <form onSubmit={sendMessage} className="w-full flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about disaster predictions..."
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !chatInput.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suggested Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  className="text-sm" 
                  onClick={() => {
                    setChatInput("What areas have the highest wildfire risk?");
                  }}
                >
                  What areas have the highest wildfire risk?
                </Button>
                <Button 
                  variant="outline" 
                  className="text-sm"
                  onClick={() => {
                    setChatInput("How can I prepare for a potential flood in my area?");
                  }}
                >
                  How can I prepare for a potential flood?
                </Button>
                <Button 
                  variant="outline" 
                  className="text-sm"
                  onClick={() => {
                    setChatInput("Explain the prediction factors for hurricanes");
                  }}
                >
                  Explain prediction factors for hurricanes
                </Button>
                <Button 
                  variant="outline" 
                  className="text-sm"
                  onClick={() => {
                    setChatInput("What is the current highest risk prediction?");
                  }}
                >
                  What is the current highest risk prediction?
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}