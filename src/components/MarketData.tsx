import React from 'react'
import type { CryptoAsset, TechnicalIndicators } from '../types/crypto'

interface Props {
  asset?: CryptoAsset
  technicals?: TechnicalIndicators
}

export const MarketData: React.FC<Props> = ({ asset, technicals }) => {
  if (!asset) return null

  return (
    <div className="mb-4 rounded-lg bg-gray-800 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{asset.name} Market Data</h3>
        <span
          className={`rounded px-2 py-1 text-sm ${
            asset.change24h >= 0 ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {asset.change24h >= 0 ? '▲' : '▼'} {Math.abs(asset.change24h).toFixed(2)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400">Price</p>
          <p className="text-xl font-bold">${asset.price.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">24h Volume</p>
          <p className="text-xl font-bold">
            ${(asset.volume24h / 1000000).toFixed(2)}M
          </p>
        </div>
      </div>

      {technicals && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <h4 className="mb-2 font-semibold">Technical Indicators</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400">RSI</p>
              <p
                className={`font-bold ${
                  technicals.rsi > 70
                    ? 'text-red-400'
                    : technicals.rsi < 30
                    ? 'text-green-400'
                    : 'text-white'
                }`}
              >
                {technicals.rsi.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-400">MACD</p>
              <p
                className={`font-bold ${
                  technicals.macd.histogram > 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {technicals.macd.histogram.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-400">BB Width</p>
              <p className="font-bold">
                {(
                  ((technicals.bollingerBands.upper -
                    technicals.bollingerBands.lower) /
                    technicals.bollingerBands.middle) *
                  100
                ).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
