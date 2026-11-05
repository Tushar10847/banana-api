/**
 * CIS046-3 Software For Enterprise
 * THEME 3: INTEROPERABILITY
 * 
 * This service implements interoperability with Marc Conrad's external Banana Game Web Service:
 * Endpoint: https://marcconrad.com/uob/banana/api.php?out=json
 * 
 * CRITICAL SECURITY & DATA INTEGRITY:
 * The remote API returns both { question, solution }.
 * If this solution were relayed to the frontend client, any user could view it via DevTools,
 * causing a severe data leak and game vulnerability.
 * 
 * To prevent data leaks:
 * 1. This service captures the solution on the server.
 * 2. It hashes/encrypts or retains the solution server-side linked to a cryptographic roundId.
 * 3. The client receives ONLY the question image URL.
 * 4. The 3-step hint system computes progressive algorithmic clues server-side without revealing the answer.
 */

const axios = require('axios');
const crypto = require('crypto');

const BANANA_API_URL = 'https://marcconrad.com/uob/banana/api.php?out=json';

class BananaService {
  /**
   * Fetches a new banana puzzle from the remote web service.
   * Interoperates via HTTP GET with JSON deserialization.
   */
  async fetchNewPuzzle() {
    try {
      const response = await axios.get(BANANA_API_URL, {
        timeout: 8000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BananaGame-Enterprise-Client/1.0'
        }
      });

      if (!response.data || typeof response.data.solution === 'undefined') {
        throw new Error('Malformed payload received from Banana API');
      }

      const rawSolution = parseInt(response.data.solution, 10);
      const questionUrl = response.data.question;

      // Generate a unique cryptographic session token for this round
      const roundId = crypto.randomUUID();

      // Simple secret salt for server-side verification integrity
      const salt = process.env.ROUND_SALT || 'banana-enterprise-secret-salt-2026';
      const encryptedSolution = crypto
        .createHmac('sha256', salt)
        .update(`${roundId}:${rawSolution}`)
        .digest('hex');

      return {
        roundId,
        questionUrl,
        rawSolution, // Kept ONLY on server
        encryptedSolution
      };
    } catch (error) {
      console.error('[INTEROPERABILITY ERROR] Failed to fetch puzzle from Banana API:', error.message);
      // Fallback puzzle in case third-party API is temporarily unreachable
      const fallbackRoundId = crypto.randomUUID();
      const fallbackSolution = 5;
      const salt = process.env.ROUND_SALT || 'banana-enterprise-secret-salt-2026';
      const encryptedSolution = crypto
        .createHmac('sha256', salt)
        .update(`${fallbackRoundId}:${fallbackSolution}`)
        .digest('hex');

      return {
        roundId: fallbackRoundId,
        questionUrl: 'https://www.sanfoh.com/uob/banana/data/t57c9117679108b75412eb702c8n67.png',
        rawSolution: fallbackSolution,
        encryptedSolution
      };
    }
  }

  /**
   * Validates user answer securely without leaking the answer.
   */
  verifyAnswer(roundId, userGuess, actualSolution) {
    const parsedGuess = parseInt(userGuess, 10);
    const parsedActual = parseInt(actualSolution, 10);
    return parsedGuess === parsedActual;
  }

  /**
   * 3-Step Hint Generator:
   * Step 1: Parity (Even or Odd)
   * Step 2: Bounded Range (e.g. between 0-4 or 5-9)
   * Step 3: Eliminates 5 incorrect keypad choices
   */
  generateHint(step, solution) {
    const num = parseInt(solution, 10);

    if (step === 1) {
      const isEven = num % 2 === 0;
      return {
        step: 1,
        title: 'Step 1: Parity Hint',
        clue: isEven ? 'The solution is an EVEN number (0, 2, 4, 6, 8)!' : 'The solution is an ODD number (1, 3, 5, 7, 9)!',
        cost: 15,
        eliminatedDigits: isEven ? [1, 3, 5, 7, 9] : [0, 2, 4, 6, 8]
      };
    }

    if (step === 2) {
      let minRange, maxRange;
      if (num <= 4) {
        minRange = 0;
        maxRange = 4;
      } else {
        minRange = 5;
        maxRange = 9;
      }
      return {
        step: 2,
        title: 'Step 2: Range Limit Hint',
        clue: `The hidden digit is between ${minRange} and ${maxRange} (inclusive)!`,
        cost: 25,
        eliminatedDigits: num <= 4 ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4]
      };
    }

    if (step === 3) {
      // Step 3: High-precision elimination
      // Pick 1 other number randomly + the real number, eliminate the other 8
      const allDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const otherDigits = allDigits.filter(d => d !== num);
      // Shuffle otherDigits
      const randomAlternative = otherDigits[Math.floor(Math.random() * otherDigits.length)];
      const survivors = [num, randomAlternative].sort((a, b) => a - b);
      const eliminated = allDigits.filter(d => !survivors.includes(d));

      return {
        step: 3,
        title: 'Step 3: Super Elimination Hint',
        clue: `Final countdown! 8 false numbers have been wiped out. The answer is either ${survivors[0]} or ${survivors[1]}!`,
        cost: 35,
        survivors,
        eliminatedDigits: eliminated
      };
    }

    throw new Error('Invalid hint step requested (1-3 available)');
  }
}

module.exports = new BananaService();
