export type Challenge = {
  id: string;
  title: string;
  publishedAt: string;
  errorCount: number;
  words: string[];
  creatorUsername: string;
};

export const challengesMock: Challenge[] = [
  {
    id: "desafio-001",
    title: "Palavras com tema de filmes",
    publishedAt: "2026-08-20",
    errorCount: 3,
    words: ["ator", "cena", "roteiro", "trilha"],
    creatorUsername: "Conecta",
  },
  {
    id: "desafio-002",
    title: "Animais e habitats",
    publishedAt: "2026-08-18",
    errorCount: 1,
    words: ["tigre", "selva", "toca", "manada"],
    creatorUsername: "Conecta",
  },
  {
    id: "desafio-003",
    title: "Tecnologia do dia a dia",
    publishedAt: "2026-08-16",
    errorCount: 5,
    words: ["nuvem", "chip", "rede", "sensor"],
    creatorUsername: "Conecta",
  },
  {
    id: "desafio-004",
    title: "Comidas brasileiras",
    publishedAt: "2026-08-12",
    errorCount: 2,
    words: ["feijao", "tapioca", "aipim", "paoca"],
    creatorUsername: "Conecta",
  },
];