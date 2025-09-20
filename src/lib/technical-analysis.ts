import { RSI, MACD, SMA, EMA, BollingerBands } from 'technicalindicators';

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: {
    current: number;
    average: number;
    ratio: number;
  };
}

export interface PredictionResult {
  score: number; // 0-100
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: 'low' | 'medium' | 'high';
  timeframe: string;
  reasoning: string[];
  priceTarget?: {
    short: number;
    medium: number;
  };
}

export class TechnicalAnalysis {
  private static readonly RSI_PERIOD = 14;
  private static readonly MACD_FAST = 12;
  private static readonly MACD_SLOW = 26;
  private static readonly MACD_SIGNAL = 9;
  private static readonly SMA_PERIODS = [20, 50];
  private static readonly BOLLINGER_PERIOD = 20;
  private static readonly BOLLINGER_STD = 2;

  static calculateIndicators(priceData: PriceData[]): TechnicalIndicators {
    if (priceData.length < 20) {
      throw new Error('Insufficient data for technical analysis');
    }
    
    console.log(`Calculating indicators with ${priceData.length} data points`);

    const closes = priceData.map(d => d.close);
    const volumes = priceData.map(d => d.volume);
    const highs = priceData.map(d => d.high);
    const lows = priceData.map(d => d.low);

    // RSI
    const rsi = RSI.calculate({
      values: closes,
      period: this.RSI_PERIOD
    });

    // MACD
    const macd = MACD.calculate({
      values: closes,
      fastPeriod: this.MACD_FAST,
      slowPeriod: this.MACD_SLOW,
      signalPeriod: this.MACD_SIGNAL,
      SimpleMAOscillator: true,
      SimpleMASignal: true
    });

    // Moving Averages
    const sma20 = SMA.calculate({
      values: closes,
      period: 20
    });

    const sma50 = SMA.calculate({
      values: closes,
      period: 50
    });

    const ema12 = EMA.calculate({
      values: closes,
      period: 12
    });

    const ema26 = EMA.calculate({
      values: closes,
      period: 26
    });

    // Bollinger Bands
    const bollingerBands = BollingerBands.calculate({
      values: closes,
      period: this.BOLLINGER_PERIOD,
      stdDev: this.BOLLINGER_STD
    });

    // Volume Analysis
    const currentVolume = volumes[volumes.length - 1];
    const averageVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const volumeRatio = currentVolume / averageVolume;

    return {
      rsi: rsi[rsi.length - 1] || 50,
      macd: {
        macd: macd[macd.length - 1]?.MACD || 0,
        signal: macd[macd.length - 1]?.signal || 0,
        histogram: macd[macd.length - 1]?.histogram || 0
      },
      sma20: sma20[sma20.length - 1] || closes[closes.length - 1],
      sma50: sma50[sma50.length - 1] || closes[closes.length - 1],
      ema12: ema12[ema12.length - 1] || closes[closes.length - 1],
      ema26: ema26[ema26.length - 1] || closes[closes.length - 1],
      bollingerBands: {
        upper: bollingerBands[bollingerBands.length - 1]?.upper || closes[closes.length - 1],
        middle: bollingerBands[bollingerBands.length - 1]?.middle || closes[closes.length - 1],
        lower: bollingerBands[bollingerBands.length - 1]?.lower || closes[closes.length - 1]
      },
      volume: {
        current: currentVolume,
        average: averageVolume,
        ratio: volumeRatio
      }
    };
  }

  static generatePrediction(indicators: TechnicalIndicators, currentPrice: number): PredictionResult {
    const reasoning: string[] = [];
    let score = 50; // Start neutral
    let bullishSignals = 0;
    let bearishSignals = 0;

    // RSI Analysis
    if (indicators.rsi < 30) {
      score += 15;
      bullishSignals++;
      reasoning.push(`RSI oversold (${indicators.rsi.toFixed(1)}) - potential bounce`);
    } else if (indicators.rsi > 70) {
      score -= 15;
      bearishSignals++;
      reasoning.push(`RSI overbought (${indicators.rsi.toFixed(1)}) - potential pullback`);
    } else if (indicators.rsi > 50) {
      score += 5;
      bullishSignals++;
      reasoning.push(`RSI bullish (${indicators.rsi.toFixed(1)})`);
    } else {
      score -= 5;
      bearishSignals++;
      reasoning.push(`RSI bearish (${indicators.rsi.toFixed(1)})`);
    }

    // MACD Analysis
    if (indicators.macd.macd > indicators.macd.signal) {
      score += 10;
      bullishSignals++;
      reasoning.push('MACD bullish crossover');
    } else {
      score -= 10;
      bearishSignals++;
      reasoning.push('MACD bearish crossover');
    }

    if (indicators.macd.histogram > 0) {
      score += 5;
      bullishSignals++;
      reasoning.push('MACD histogram positive');
    } else {
      score -= 5;
      bearishSignals++;
      reasoning.push('MACD histogram negative');
    }

    // Moving Average Analysis
    if (indicators.sma20 > indicators.sma50) {
      score += 10;
      bullishSignals++;
      reasoning.push('SMA 20 > SMA 50 - uptrend');
    } else {
      score -= 10;
      bearishSignals++;
      reasoning.push('SMA 20 < SMA 50 - downtrend');
    }

    if (currentPrice > indicators.sma20) {
      score += 8;
      bullishSignals++;
      reasoning.push('Price above SMA 20');
    } else {
      score -= 8;
      bearishSignals++;
      reasoning.push('Price below SMA 20');
    }

    // Bollinger Bands Analysis
    if (currentPrice < indicators.bollingerBands.lower) {
      score += 12;
      bullishSignals++;
      reasoning.push('Price below lower Bollinger Band - oversold');
    } else if (currentPrice > indicators.bollingerBands.upper) {
      score -= 12;
      bearishSignals++;
      reasoning.push('Price above upper Bollinger Band - overbought');
    } else if (currentPrice > indicators.bollingerBands.middle) {
      score += 5;
      bullishSignals++;
      reasoning.push('Price above middle Bollinger Band');
    } else {
      score -= 5;
      bearishSignals++;
      reasoning.push('Price below middle Bollinger Band');
    }

    // Volume Analysis
    if (indicators.volume.ratio > 1.5) {
      score += 8;
      bullishSignals++;
      reasoning.push(`High volume (${indicators.volume.ratio.toFixed(1)}x average) - strong interest`);
    } else if (indicators.volume.ratio < 0.5) {
      score -= 5;
      bearishSignals++;
      reasoning.push(`Low volume (${indicators.volume.ratio.toFixed(1)}x average) - weak interest`);
    }

    // Determine direction and confidence
    let direction: 'bullish' | 'bearish' | 'neutral';
    let confidence: 'low' | 'medium' | 'high';

    if (bullishSignals > bearishSignals + 2) {
      direction = 'bullish';
      confidence = bullishSignals > bearishSignals + 4 ? 'high' : 'medium';
    } else if (bearishSignals > bullishSignals + 2) {
      direction = 'bearish';
      confidence = bearishSignals > bullishSignals + 4 ? 'high' : 'medium';
    } else {
      direction = 'neutral';
      confidence = 'low';
    }

    // Clamp score between 0-100
    score = Math.max(0, Math.min(100, score));

    // Calculate price targets
    const priceTarget = this.calculatePriceTargets(currentPrice, indicators, direction);

    return {
      score: Math.round(score),
      direction,
      confidence,
      timeframe: '1-24 hours',
      reasoning,
      priceTarget
    };
  }

  private static calculatePriceTargets(
    currentPrice: number, 
    indicators: TechnicalIndicators, 
    direction: 'bullish' | 'bearish' | 'neutral'
  ): { short: number; medium: number } {
    // Use realistic volatility percentages based on crypto market
    let baseVolatility: number;
    
    if (currentPrice < 0.001) {
      // Very low price tokens (like memecoins) - higher volatility
      baseVolatility = 0.15; // 15%
    } else if (currentPrice < 0.01) {
      // Low price tokens - medium-high volatility
      baseVolatility = 0.10; // 10%
    } else if (currentPrice < 1) {
      // Medium price tokens - medium volatility
      baseVolatility = 0.08; // 8%
    } else {
      // Higher price tokens - lower volatility
      baseVolatility = 0.05; // 5%
    }
    
    // Adjust based on RSI - extreme RSI values indicate higher volatility potential
    const rsiVolatilityAdjustment = Math.abs(indicators.rsi - 50) / 50; // 0-1 scale
    const adjustedVolatility = baseVolatility * (0.5 + rsiVolatilityAdjustment);
    
    // Calculate price moves
    const shortMove = currentPrice * adjustedVolatility * 0.3; // 30% of volatility
    const mediumMove = currentPrice * adjustedVolatility * 0.6; // 60% of volatility
    
    let shortTarget: number;
    let mediumTarget: number;
    
    if (direction === 'bullish') {
      shortTarget = currentPrice + shortMove;
      mediumTarget = currentPrice + mediumMove;
    } else if (direction === 'bearish') {
      shortTarget = currentPrice - shortMove;
      mediumTarget = currentPrice - mediumMove;
    } else {
      // Neutral - show both directions with smaller moves
      shortTarget = currentPrice + shortMove * 0.5;
      mediumTarget = currentPrice - shortMove * 0.5;
    }
    
    // Ensure targets are reasonable (not negative, not too extreme)
    shortTarget = Math.max(currentPrice * 0.1, Math.min(currentPrice * 10, shortTarget));
    mediumTarget = Math.max(currentPrice * 0.1, Math.min(currentPrice * 10, mediumTarget));
    
    console.log('Price target calculation:', {
      currentPrice,
      baseVolatility,
      adjustedVolatility,
      shortMove,
      mediumMove,
      shortTarget,
      mediumTarget,
      direction
    });
    
    return {
      short: shortTarget,
      medium: mediumTarget
    };
  }
}
