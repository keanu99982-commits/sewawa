const axios = require("axios");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { projectName, framework } = JSON.parse(event.body);

  // TOKEN LANGSUNG DI KODE (RISIKO KEAMANAN)
  const VERCEL_TOKEN = "vck_4GOsMdGXEfQaKFajP8QNuKPyDfJNGFiOagcc2FQxLELGngLxNh2ED1I4";

  try {
    const response = await axios.post(
      "https://api.vercel.com/v9/projects",
      {
        name: projectName,
        framework: framework || "nextjs",
      },
      {
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Project berhasil dibuat di Vercel!", project: response.data }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.response?.data || err.message }),
    };
  }
};
