# PLP Risk Console

## 项目简介（中文）

PLP Risk Console 是一个面向 DeepBook 流动性提供者（PLP）的风险管理面板。它实时展示 PLP vault 的关键风险指标，包括资金利用率、无常损失预估和清算边界，帮助 LP 做出更明智的流动性管理决策。

该控制台还集成了 BTC 情景模拟功能，允许用户设置不同的 BTC 价格变动场景，模拟对 PLP vault 各项风险指标的影响。通过这种压力测试方式，LP 可以更好地理解极端行情下的风险暴露，提前做好风控准备。

## Reviewer Flow / 评委操作路径

1. 打开 `https://plp-risk-console.ygz0425.workers.dev`
2. 连接 Sui Wallet 并切换到 Testnet
3. 查看主面板上的 PLP vault 风险指标概览
4. 使用 BTC 情景模拟器输入不同的价格假设，观察风险指标变化

## 部署信息

| 项目 | |
|------|------|
| 环境 | Testnet |
| 部署 URL | `https://plp-risk-console.ygz0425.workers.dev` |
| Package ID | `0xdda63496bc8031bd7521f196d1091330be084ff4974b18e6e5a6603b5bf12125` |

## 链上交易

| 交易 | Digest |
|------|--------|
| 合约发布 (Publish) | `5sv7BfD93CWRFLbkiqAoFN7dTt9HC2sH786iEXGGdaTV` |
| `record_snapshot()` — 记录测试风险快照 | `Gw3st2YjYxaxLLFNBDtftshGVGDejD7jPbi6csmxa7X6` |

## 赛道

DeepBook

## 技术栈

- 前端: TanStack Start + Bun + shadcn/ui
- 合约: Move (Sui)
- 部署: Cloudflare Workers

## 链上交易验证

该项目使用以下真实 Sui Testnet 交易进行验证：

| 交易 | Digest | 状态 |
|------|--------|------|
| SUI Transfer | `FrZVaDnCULPp6FW8rWJGM2MHfN7YJkxkzFoXYYMwCpSv` | ✅ Success ([查看](https://testnet.suivision.xyz/txblock/FrZVaDnCULPp6FW8rWJGM2MHfN7YJkxkzFoXYYMwCpSv)) |
| SUI Transfer | `3RrvRuoe9V5TiSskBDktBhU8YatPUwGhihur5U1tvzF2` | ✅ Success ([查看](https://testnet.suivision.xyz/txblock/3RrvRuoe9V5TiSskBDktBhU8YatPUwGhihur5U1tvzF2)) |

