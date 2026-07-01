import { GoogleGenAI, Type } from '@google/genai';

export const llmService = {
  getAiClient: () => {
    return new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  },

  isAvailable: () => {
    return !!process.env.GEMINI_API_KEY;
  },

  planGoal: async (goal: string) => {
    const ai = llmService.getAiClient();
    const createTasksDeclaration = {
      name: "createTasks",
      description: "Create a set of tasks to achieve a specific goal.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          generatedTasks: {
            type: Type.ARRAY,
            description: "The list of tasks required to achieve the goal.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Title of the task" },
                description: { type: Type.STRING, description: "Detailed description of the task" },
                priority: { type: Type.STRING, description: "High, Medium, or Low" },
                riskLevel: { type: Type.STRING, description: "low, medium, or high" }
              },
              required: ["title", "description", "priority", "riskLevel"]
            }
          }
        },
        required: ["generatedTasks"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Decompose the following goal into actionable tasks for an organization: "${goal}". Keep the number of tasks reasonable (3-5).`,
      config: {
        systemInstruction: "You are the Main Brain of an Autonomous Multi-Agent Governance Orchestrator OS. Your job is to decompose user goals into tasks with title, description, priority, and risk level. Never output markdown json, use the function call.",
        tools: [{ functionDeclarations: [createTasksDeclaration] }]
      }
    });

    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const createTasksCall = functionCalls.find(call => call.name === 'createTasks');
      if (createTasksCall && createTasksCall.args) {
        return createTasksCall.args.generatedTasks || [];
      }
    }
    
    if (response.text) {
      try {
        const parsed = JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, ''));
        if (parsed.generatedTasks) return parsed.generatedTasks;
        if (Array.isArray(parsed)) return parsed;
      } catch(e) {}
    }
    return [];
  },

  evaluateContext: async (context: string) => {
    const ai = llmService.getAiClient();
    
    const sendNotification = {
      name: "sendNotification",
      description: "Send an important notification to the organization administrators.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING, description: "The notification message content" },
          urgency: { type: Type.STRING, description: "Low, Medium, High, or Critical" }
        },
        required: ["message", "urgency"]
      }
    };

    const blockWorkflow = {
      name: "blockWorkflow",
      description: "Halt a workflow or process immediately due to detected risks or policy violations.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          reason: { type: Type.STRING, description: "The reason for blocking the workflow" },
          targetEntity: { type: Type.STRING, description: "What is being blocked (e.g., 'Agent 007', 'Task #42')" }
        },
        required: ["reason", "targetEntity"]
      }
    };

    const approveAction = {
      name: "approveAction",
      description: "Automatically approve a pending action if the risk is deemed acceptable by the Main Brain.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          justification: { type: Type.STRING, description: "Why the action is being approved" }
        },
        required: ["justification"]
      }
    };

    const saveMemory = {
      name: "saveMemory",
      description: "Save a new organizational rule, observation, or insight to the permanent Memory System.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title of the memory" },
          category: { type: Type.STRING, description: "Category: 'org', 'governance', 'task', or 'agent'" },
          content: { type: Type.STRING, description: "The core content of the memory to store" }
        },
        required: ["title", "category", "content"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following execution context, decide if any external action must be taken immediately. Context: "${context}"`,
      config: {
        systemInstruction: "You are the Main Brain's Execution Context router. You analyze incoming context and invoke the most appropriate external function (sendNotification, blockWorkflow, approveAction, saveMemory). If no action is needed, output a JSON object with { \"status\": \"no_action_needed\" } without using any tools.",
        tools: [{ functionDeclarations: [sendNotification, blockWorkflow, approveAction, saveMemory] }]
      }
    });

    return response;
  }
};
