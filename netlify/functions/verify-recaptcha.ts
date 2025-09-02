import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const { token } = JSON.parse(event.body);

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing reCAPTCHA token" }),
      };
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = (await response.json()) as {
      success: boolean;
      score?: number;
      [key: string]: any;
    };

    if (data.success && (data.score ?? 0) >= 0.5) {
      return {
        statusCode: 200,
        body: JSON.stringify({ verified: true, score: data.score }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          verified: false,
          score: data.score,
          errorCodes: data["error-codes"] ?? [],
        }),
      };
    }
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message }),
    };
  }
};
