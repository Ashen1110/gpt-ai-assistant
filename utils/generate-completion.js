import config from '../config/index.js';
import { MOCK_TEXT_OK } from '../constants/mock.js';
import { createChatCompletion, FINISH_REASON_STOP, FINISH_REASON_TOOL_CALLS, ROLE_AI } from '../services/openai.js';
import tools from './tools.js';
import { executeToolCall } from './execute-tools.js';

class Completion {
  text;

  finishReason;

  constructor({
    text,
    finishReason,
  }) {
    this.text = text;
    this.finishReason = finishReason;
  }

  get isFinishReasonStop() {
    return this.finishReason === FINISH_REASON_STOP;
  }
}

/**
 * @param {Object} param
 * @param {Prompt} param.prompt
 * @returns {Promise<Completion>}
 */
const generateCompletion = async ({
  prompt,
}) => {
  if (config.APP_ENV !== 'production') return new Completion({ text: MOCK_TEXT_OK });
  
  const messages = [...prompt.messages];
  const maxIterations = 3; // 減少迭代次數避免超時
  let iterations = 0;
  
  // 是否啟用 Function Calling
  const enableFunctionCalling = config.OPENAI_ENABLE_FUNCTION_CALLING;
  
  while (iterations < maxIterations) {
    iterations++;
    
    const requestParams = {
      messages,
    };
    
    // 如果啟用 Function Calling，加入工具定義
    if (enableFunctionCalling) {
      requestParams.tools = tools;
      requestParams.toolChoice = 'auto';
    }
    
    const { data } = await createChatCompletion(requestParams);
    const [choice] = data.choices;
    const { message, finish_reason: finishReason } = choice;
    
    // 如果 AI 決定調用工具
    if (finishReason === FINISH_REASON_TOOL_CALLS && message.tool_calls) {
      // 將 AI 的回應加入訊息歷史
      messages.push(message);
      
      // 執行所有工具調用
      for (const toolCall of message.tool_calls) {
        const { id, function: func } = toolCall;
        const { name, arguments: argsString } = func;
        
        let args;
        try {
          args = JSON.parse(argsString);
        } catch (e) {
          args = {};
        }
        
        // 執行工具
        const result = await executeToolCall(name, args);
        
        // 將工具結果加入訊息歷史
        messages.push({
          role: 'tool',
          tool_call_id: id,
          content: result,
        });
      }
      
      // 繼續下一輪對話，讓 AI 根據工具結果生成回應
      continue;
    }
    
    // 正常結束或達到長度限制
    return new Completion({
      text: message.content?.trim() || '',
      finishReason,
    });
  }
  
  // 超過最大迭代次數
  throw new Error('工具調用次數超過限制');
};

export default generateCompletion;
