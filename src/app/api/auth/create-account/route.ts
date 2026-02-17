import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, password } = await req.json();

    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

    if (!domain || !clientId) {
      console.error("Missing AUTH0_DOMAIN or NEXT_PUBLIC_AUTH0_CLIENT_ID");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    // Call Auth0 Database Connections signup endpoint
    const auth0Res = await fetch(`https://${domain}/dbconnections/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        connection: "Username-Password-Authentication",
        email,
        password,
        given_name: firstName,
        family_name: lastName,
        name: `${firstName} ${lastName}`,
      }),
    });

    if (!auth0Res.ok) {
      const errorData = await auth0Res.json().catch(() => ({}));
      console.error("Auth0 signup error:", errorData);

      // Map common Auth0 errors to user-friendly messages
      if (errorData.code === "invalid_password") {
        return NextResponse.json(
          {
            error:
              errorData.policy ||
              "Password does not meet requirements. Use at least 8 characters with a mix of letters, numbers, and symbols.",
          },
          { status: 400 }
        );
      }
      if (
        errorData.code === "user_exists" ||
        errorData.code === "username_exists"
      ) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: auth0Res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create account error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
