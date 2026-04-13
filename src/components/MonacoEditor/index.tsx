import { Editor } from "@monaco-editor/react";
import { useRootContext } from "../../state/rootContext";

const MonacoEditor = () => {
  const {
    state: { code },
    actions: { setCode },
  } = useRootContext();

  const handleChange = (value: string | undefined) => {
    setCode(value || "");
  };

  return (
    <div className="h-full">
      <Editor
        height="100%"
        defaultLanguage="typescript"
        value={code}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default MonacoEditor;

export const DEFAULTVALUECODE = `

'use client';

import { useEffect, useRef, useState } from 'react';
import { Edge, Node } from 'reactflow';
import { useRootContext } from '@/state/rootContext';
import { Textarea } from '@cu/ui-kit';
import { cn } from '@/utils/cn';
import { IconButton, Icons } from '@cu/ui-kit';
import { io, Socket } from 'socket.io-client';
import { AIService } from '@/services/AIService';
import { useRouteParams } from '@/hooks/useRouteParams';
import { useEnvContext } from 'next-runtime-env';

interface AIResponse {
  status: string;
  user_id: string;
  workflow_id: string;
  message: string;
  ai_response: {
    content: string;
    is_result: boolean;
    requires_input: boolean;
    session_id: string;
    type: string;
    workflow: {
      id: string;
      name: string;
      data: {
        nodes: Node[];
        edges: Edge[];
        isFlowActive: boolean;
      };
    };
    [key: string]: any;
  };
}

function ThinkingAnimation() {
  return (
    <div className="flex items-center">
      <div className="flex space-x-1.5">
        <div
          className="h-2 w-2 animate-pulse rounded-full bg-global-primary1"
          style={{ animationDelay: '0ms' }}
        ></div>
        <div
          className="h-2 w-2 animate-pulse rounded-full bg-global-primary1"
          style={{ animationDelay: '300ms' }}
        ></div>
        <div
          className="h-2 w-2 animate-pulse rounded-full bg-global-primary1"
          style={{ animationDelay: '600ms' }}
        ></div>
      </div>
    </div>
  );
}

interface Props {
  getWorkflow: () => any;
  setWorkflow: (nodes: Node[], edges: Edge[]) => void;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'ai';
}

export const ChatInterface = ({ getWorkflow, setWorkflow }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const {
    state: { user, addedIntegrations },
  } = useRootContext();
  const { id: flowId } = useRouteParams();
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);
  const { NEXT_PUBLIC_API_URL } = useEnvContext();
  const socket = useRef<Socket | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isMinimized]);

  useEffect(() => {
    socket.current = io(NEXT_PUBLIC_API_URL, {
      withCredentials: true,
      reconnection: false,
      transports: ['websocket'],
      path: '/ws',
      autoConnect: true,
    });
    socket.current?.on('connect', () => {
      console.log('Socket connected');
    });
  }, []);

  const handleSubmit = async () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: input,
        role: 'user',
      },
    ]);
    setInput('');
    setLoading(true);

    const payload = {
      user_id: user?.user_id,
      socket_id: user?.user_id,
      user_prompt: input,
      workflow_id: flowId,
      workflow_config: getWorkflow(),
    };

    console.log('Sending: ', payload);

    socket.current?.emit('ai_chat', payload);

    socket.current?.on('ai_chat', (data: AIResponse) => {
      console.log('Received message from ws:', data);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data.message,
          role: 'ai',
        },
      ]);
      if (data.ai_response.is_result) {
        setLoading(false);
        setWorkflow(data.ai_response.workflow.data.nodes, data.ai_response.workflow.data.edges);
      }

      if (data.ai_response.requires_input) {
        setLoading(false);
      }

      if (data.status === 'error') {
        setLoading(false);
      }
    });

    socket.current?.on('disconnect', () => {
      console.log('Socket disconnected');
      socket.current = null;
      setLoading(false);
    });

    socket.current?.on('error', (err) => {
      console.error('Socket error: ', err);
      socket.current?.close();
      socket.current?.disconnect();
      socket.current = null;
      setLoading(false);
    });

    socket.current?.on('connect_error', (err) => {
      console.error('Socket connect_error:', err);
      socket.current?.disconnect();
      setLoading(false);
    });
  };

  const handleInputChange = (e: any) => {
    setInput(e.target.value);
  };

  return !isOpen ? (
    <IconButton
      icon={Icons.Sparks}
      onClick={() => {
        setIsOpen(true);
        setIsMinimized(false);
      }}
      iconClassname="!h-6 !w-6"
      className="fixed bottom-14 right-6 h-12 w-12 rounded-full shadow-lg"
    />
  ) : (
    <div className="fixed bottom-6 right-6 z-50 flex w-80 flex-col overflow-hidden rounded-lg border border-base-20 bg-base-0 shadow-xl md:w-96">
      <div className="flex items-center justify-between bg-global-primary1 px-4 py-3 text-base-0">
        <div className="flex items-center">
          <Icons.Sparks width={20} height={20} className="mr-2" />
          <h2 className="font-medium">Workflow AI</h2>
        </div>
        <div className="flex items-center space-x-1">
          <IconButton
            icon={isMinimized ? Icons.ArrowTop : Icons.ArrowDown}
            onClick={() => setIsMinimized(!isMinimized)}
          />
          <IconButton onClick={() => setIsOpen(false)} icon={Icons.Close} />
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-base-0">
                  <Icons.Sparks width={24} height={24} className="text-global-primary1" />
                </div>
                <h3 className="mb-1 text-lg text-base-60">Create your workflow with AI</h3>
              </div>
            ) : (
              <div className="max-h-80 space-y-4 overflow-auto">
                {messages.map((message) => (
                  <div
                    key={"some key"}
                    className="flex justify-start"
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-lg border border-base-20 bg-base-1 px-4 py-2 text-sm text-base-60',
                        {
                          'bg-global-primary1 text-base-0': message.role === 'user',
                        },
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg border border-base-20 bg-base-0 px-4 py-2 text-base-60">
                      <ThinkingAnimation />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-base-20 p-3">
            <div className="flex items-center space-x-2">
              <div className="w-full flex-1">
                <Textarea
                  reference={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder={loading ? 'Loading...' : 'Type your message...'}
                  className="min-h-20 w-full border-base-20"
                  disabled={loading}
                  name="promt"
                  onKeyDown={(event) => {
                    if (event.code === 'Enter' && !loading && input.trim()) {
                      handleSubmit();
                    }
                  }}
                />
              </div>
              <IconButton
                icon={Icons.Send}
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

`
