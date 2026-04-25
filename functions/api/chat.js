export async function onRequestPost(ctx) {
  const { request, env } = ctx;

  try {
    const { message, history, context } = await request.json();
    const GROQ_KEY = env.GROQ_API_KEY;

    const today = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Monta contexto do usuário
    let userContext = `Hoje: ${today}\n`;
    if (context?.tasks) userContext += `\nTarefas pendentes:\n${context.tasks || 'Nenhuma'}\n`;
    if (context?.notes) userContext += `\nNotas recentes:\n${context.notes || 'Nenhuma'}\n`;
    if (context?.recent) userContext += `\nHistórico recente:\n${context.recent}\n`;

    const systemPrompt = `Você é o assistente pessoal do Gabriel Salbé. Responda de forma direta, empática e em português.

Gabriel: 28 anos, analista no Banpara, TDAH/TOC/TAG, casado com Talita, Testemunha de Jeová.
Projetos: FastFixStore, app JW, app finanças, app academia, app lista, app Swift, app dominó.

${userContext}

Regras:
- Responda de forma natural e direta
- Use o contexto acima para personalizar as respostas
- Se Gabriel mencionar uma tarefa, confirme que foi anotada
- Seja empático especialmente em assuntos de saúde mental`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 600,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(history || []).slice(-10),
          { role: 'user', content: message }
        ]
      })
    });

    const groqData = await groqRes.json();
    if (!groqRes.ok) throw new Error(groqData.error?.message || 'Groq error');
    
    const reply = groqData.choices?.[0]?.message?.content || 'Sem resposta.';

    return new Response(JSON.stringify({ reply, saved: null }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ reply: `Erro: ${e.message}`, saved: null }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
