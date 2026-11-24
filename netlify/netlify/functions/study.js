exports.handler = async (event) => {

  if (event.httpMethod !== "POST") {

    return {

      statusCode: 405,

      body: JSON.stringify({ error: "Método no permitido." })

    };

  }

  if (!process.env.OPENAI_API_KEY) {

    return {

      statusCode: 503,

      body: JSON.stringify({

        error: "Falta configurar OPENAI_API_KEY en Netlify."

      })

    };

  }

  try {

    const { action, topic, level, length, summary } =

      JSON.parse(event.body || "{}");

    if (!topic || topic.length > 300) {

      return {

        statusCode: 400,

        body: JSON.stringify({ error: "Ingresá un tema válido." })

      };

    }

    let prompt;

    if (action === "summary") {

      prompt = `Sos un profesor paciente. Escribí en español claro y sencillo, adecuado para nivel ${level}. Prepará un resumen ${length} sobre: ${topic}. Usá títulos breves, puntos importantes y ejemplos cuando ayuden. No inventes datos.`;

    } else if (action === "quiz") {

      prompt = `Basándote en este resumen, creá 5 preguntas de opción múltiple sobre ${topic}. Resumen: ${summary}. Respondé SOLO JSON válido con esta forma: {"questions":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}]}. answer es el índice de la respuesta correcta, de 0 a 3.`;

    } else {

      return {

        statusCode: 400,

        body: JSON.stringify({ error: "Acción desconocida." })

      };

    }

    const ai = await fetch(

      "https://api.openai.com/v1/chat/completions",

      {

        method: "POST",

        headers: {

          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,

          "Content-Type": "application/json"

        },

        body: JSON.stringify({

          model: "gpt-4o-mini",

          messages: [{ role: "user", content: prompt }],

          temperature: 0.5

        })

      }

    );

    const payload = await ai.json();

    if (!ai.ok) {

      throw new Error(payload.error?.message || "Error de IA.");

    }

    const content = payload.choices?.[0]?.message?.content || "";

    if (action === "quiz") {

      const cleaned = content

        .replace(/^```(?:json)?\s*/i, "")

        .replace(/\s*```$/, "");

      const parsed = JSON.parse(cleaned);

      return {

        statusCode: 200,

        body: JSON.stringify({

          questions: parsed.questions

        })

      };

    }

    return {

      statusCode: 200,

      body: JSON.stringify({ summary: content })

    };

  } catch (error) {

    return {

      statusCode: 500,

      body: JSON.stringify({ error: error.message })

    };

  }

};
