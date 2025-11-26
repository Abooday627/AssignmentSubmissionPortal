/**
 * Telegram Bot Integration Helper
 * Handles sending messages and files to Telegram bots
 */

import axios from 'axios';

interface TelegramSendMessageParams {
  botToken: string;
  chatId: string;
  message: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

interface TelegramSendDocumentParams {
  botToken: string;
  chatId: string;
  fileUrl: string;
  fileName: string;
  caption?: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

/**
 * Send a text message to a Telegram chat
 */
export async function sendTelegramMessage({
  botToken,
  chatId,
  message,
  parseMode = 'HTML',
}: TelegramSendMessageParams): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: parseMode,
    });

    return response.status === 200;
  } catch (error) {
    console.error('[Telegram] Failed to send message:', error);
    return false;
  }
}

/**
 * Send a document (file) to a Telegram chat
 * Supports sending files via URL
 */
export async function sendTelegramDocument({
  botToken,
  chatId,
  fileUrl,
  fileName,
  caption,
  parseMode = 'HTML',
}: TelegramSendDocumentParams): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendDocument`;
    
    const response = await axios.post(url, {
      chat_id: chatId,
      document: fileUrl,
      caption: caption,
      parse_mode: parseMode,
    });

    return response.status === 200;
  } catch (error) {
    console.error('[Telegram] Failed to send document:', error);
    return false;
  }
}

/**
 * Format submission details as a Telegram message
 */
export function formatSubmissionMessage(
  studentName: string,
  universityName: string,
  specializationName: string,
  groupNumber: string,
  fileCount: number
): string {
  const message = `
<b>📝 New Assignment Submission</b>

<b>Student Name:</b> ${studentName}
<b>University:</b> ${universityName}
<b>Specialization:</b> ${specializationName}
<b>Group Number:</b> ${groupNumber}
<b>Files Submitted:</b> ${fileCount}

<i>Submitted at: ${new Date().toLocaleString()}</i>
  `.trim();

  return message;
}

/**
 * Send a complete submission to Telegram with all files
 */
export async function sendSubmissionToTelegram(
  botToken: string,
  chatId: string,
  studentName: string,
  universityName: string,
  specializationName: string,
  groupNumber: string,
  files: Array<{ fileName: string; fileUrl: string }>
): Promise<boolean> {
  try {
    // Send main message with submission details
    const message = formatSubmissionMessage(
      studentName,
      universityName,
      specializationName,
      groupNumber,
      files.length
    );

    const messageSent = await sendTelegramMessage({
      botToken,
      chatId,
      message,
    });

    if (!messageSent) {
      console.warn('[Telegram] Failed to send submission message');
      return false;
    }

    // Send each file as a separate document
    let allFilesSent = true;
    for (const file of files) {
      const fileSent = await sendTelegramDocument({
        botToken,
        chatId,
        fileUrl: file.fileUrl,
        fileName: file.fileName,
        caption: `📎 ${file.fileName}`,
      });

      if (!fileSent) {
        console.warn(`[Telegram] Failed to send file: ${file.fileName}`);
        allFilesSent = false;
      }
    }

    return allFilesSent;
  } catch (error) {
    console.error('[Telegram] Failed to send submission:', error);
    return false;
  }
}
