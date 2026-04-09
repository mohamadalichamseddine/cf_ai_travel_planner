# AI Travel Planner

An AI-powered travel planning agent built on Cloudflare Workers. Plan trips through natural conversation. The agent searches real flights, hotels, and weather data, tracks your budget, and assembles a complete itinerary.

**Live demo:** [cf-ai-travel-planner.MY_SUBDOMAIN.workers.dev](https://cf-ai-travel-planner.MY_SUBDOMAIN.workers.dev)

## What it does

Chat with the agent to plan a trip. It can:

- **Search flights** -> real prices from Skyscanner via Apify (origin, destination, dates, cabin class)
- **Search hotels** -> real listings from Booking.com via Apify (destination, dates, star rating, price range)
- **Check weather** -> current conditions and 5-day forecast via Open-Meteo
- **Track budget** -> calculates remaining budget after flights and hotels
- **Save trip plans** -> persists the assembled itinerary across page refreshes

Example: *"Plan a trip from NYC to San Francisco, April 25-30, budget $2000"* — the agent searches flights and hotels, presents options with prices, and tracks your spending.

## Architecture

```
Browser (React SPA)
  │ WebSocket
  ▼
Cloudflare Worker
  │
  ▼
ChatAgent (Durable Object)
  ├── Workers AI (Moonshotai Kimi K2.5)
  ├── Flight search (Apify REST API → Skyscanner)
  ├── Hotel search (Apify REST API → Booking.com)
  ├── Weather (Open-Meteo API)
  ├── Budget calculator
  └── DO SQLite storage (chat history, trip state)
```

- **Runtime:** Cloudflare Workers + Durable Objects
- **LLM:** Workers AI - `@cf/moonshotai/kimi-k2.5`
- **Agent framework:** Cloudflare Agents SDK + Vercel AI SDK
- **Frontend:** React + Tailwind + Kumo design system
- **Storage:** Durable Object SQLite (conversation history, trip state)
- **External data:** Apify REST API (flights, hotels), Open-Meteo (weather)

Each user gets an isolated session via a UUID stored in `localStorage`, which maps to a dedicated Durable Object instance.

## Project structure

```
src/
├── index.ts                        # Worker entry point
├── agent.ts                        # ChatAgent class (Durable Object)
├── tools/
│   ├── index.ts                    # Tool registry
│   ├── flights.ts                  # Flight search (Apify/Skyscanner)
│   ├── hotels.ts                   # Hotel search (Apify/Booking.com)
│   ├── budget.ts                   # Budget calculator
│   ├── itinerary.ts                # Trip state management
│   ├── date.ts                     # Current date tool
│   └── weather/
│       ├── WeatherServiceProvider.ts   # Provider interface
│       ├── OpenMeteoProvider.ts         # Open-Meteo implementation
│       └── WeatherTool.ts              # Weather tool factory
├── mcp/
│   └── connections.ts              # MCP reference (not active)
├── prompts/
│   └── system.ts                   # System prompt
├── types/
│   ├── state.ts                    # TravelState, TripPlan types
│   └── tools.ts                    # Tool parameter types
└── frontend/
    ├── app.tsx                     # Chat UI
    ├── client.tsx                  # React entry point
    └── styles.css                  # Tailwind styles
```

## Setup

### Prerequisites

- Node.js 18+
- Cloudflare account (free tier works)
- Apify account (free tier - for flight and hotel search)

### Local development

```bash
git clone https://github.com/mohamadalichamseddine/cf_ai_travel_planner.git
cd cf_ai_travel_planner
npm install
```

Create a `.dev.vars` file with your API keys:

```
APIFY_TOKEN=your_apify_token_here
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Deploy to Cloudflare

Set your secret:

```bash
wrangler secret put APIFY_TOKEN
```

Deploy:

```bash
npm run deploy
```

## Limitations

- **No authentication** -> sessions are tied to a browser via `localStorage` UUID. Clearing browser data loses the session.
- **Apify free tier limits** -> flight and hotel searches consume Apify credits. Results may be slow (up to 2 minutes) as the scraper runs synchronously.
- **Single LLM** -> uses Workers AI with a single model (`kimi-k2.5`). No fallback if the model is unavailable.
- **No multi-trip storage** -> only the current trip is persisted. Starting a new trip clears the previous one.
- **Hotel search without dates** -> works but cannot sort by price and may return limited pricing info.

For more details on known limitations and potential fixes, see [docs/limitations.md](docs/limitations.md).

## Future improvements

- Structured flight/hotel result cards instead of markdown rendering
- Budget summary widget displayed persistently during trip planning
- Mobile responsive layout optimization
- Multi-trip storage -> save and revisit previous trip plans
- User authentication via Cloudflare Access for cross-device sessions
- Alternative flight data source (e.g. Kayak via `shahidirfan/kayak-flights-scraper`)
- MCP server integration (currently blocked by Agents SDK schema conversion limitations)

## License

MIT (bootstrapped from [cloudflare/agents-starter](https://github.com/cloudflare/agents-starter))

---

*Last edited: 04-09-2026*
