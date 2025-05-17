import { type NextRequest, NextResponse } from "next/server"

// Steam API key - in production, this should be an environment variable
const STEAM_API_KEY = process.env.STEAM_API_KEY || "A6EA33F1E638BAB09E2BF484E9B767FA"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = Object.fromEntries(searchParams.entries())

    // Validate the OpenID response
    if (params["openid.mode"] === "id_res" && params["openid.claimed_id"]) {
      // Extract the Steam ID from the claimed_id
      const steamId = params["openid.claimed_id"].split("/").pop()

      if (steamId) {
        console.log("Steam ID:", steamId)
        console.log("Using API Key:", STEAM_API_KEY)

        // Fetch user data from Steam API
        const userDataResponse = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`,
        )

        if (!userDataResponse.ok) {
          console.error("Steam API error:", await userDataResponse.text())
          throw new Error(`Steam API returned ${userDataResponse.status}`)
        }

        const userData = await userDataResponse.json()

        if (!userData.response || !userData.response.players || userData.response.players.length === 0) {
          console.error("No player data returned from Steam API:", userData)
          throw new Error("No player data returned from Steam API")
        }

        const player = userData.response.players[0]
        console.log("Player data:", player)

        // Determine the base URL for redirection
        let baseUrl = process.env.NEXT_PUBLIC_SITE_URL

        if (!baseUrl) {
          // Try to determine from request
          baseUrl = request.headers.get("origin") || request.headers.get("referer")

          if (!baseUrl) {
            // Last resort fallback
            baseUrl = "http://localhost:3000"
          } else if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.slice(0, -1)
          }
        }

        console.log("Redirecting to base URL:", baseUrl)

        // Create a redirect URL with the user data
        const redirectUrl = new URL("/", baseUrl)

        // Add user data to the URL as a parameter
        redirectUrl.searchParams.set("login", "success")
        redirectUrl.searchParams.set("userData", JSON.stringify(player))

        return NextResponse.redirect(redirectUrl)
      }
    }

    // If validation fails or no Steam ID is found
    console.error("Steam authentication failed:", params)

    // Determine base URL for error redirection
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!baseUrl) {
      baseUrl = request.headers.get("origin") || request.headers.get("referer")

      if (!baseUrl) {
        baseUrl = "http://localhost:3000"
      } else if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1)
      }
    }

    return NextResponse.redirect(new URL("/?login=failed", baseUrl))
  } catch (error) {
    console.error("Steam authentication error:", error)

    // Determine base URL for error redirection
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!baseUrl) {
      baseUrl = request.headers.get("origin") || request.headers.get("referer")

      if (!baseUrl) {
        baseUrl = "http://localhost:3000"
      } else if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1)
      }
    }

    return NextResponse.redirect(new URL("/?login=error", baseUrl))
  }
}
