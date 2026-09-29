export type WordTile = {
  id: string;
  label: string;
  groupId: string;
};

export type WordGroupColor = "blue" | "green" | "orange" | "purple";

export type WordGroup = {
  id: string;
  title: string;
  color: WordGroupColor;
  connection: string;
};

export type WordBoard = {
  id: string;
  title: string;
  publishedAt: string;
  errorCountLabel: string;
  groups: WordGroup[];
  words: WordTile[];
  creatorUsername: string;
  attempt: {
    errorCount: number;
    completed: boolean;
  };
};

export const wordBoardMock = {
  title: "Encontre os grupos de 4 palavras",
  publishedAt: "24 ago 2026",
  errorCountLabel: "Quantidade de erros",
  groups: [
    { id: "animais", title: "Animais", color: "blue", connection: "Animais terrestres" },
    { id: "comidas", title: "Comidas", color: "green", connection: "Comidas populares" },
    { id: "objetos", title: "Objetos", color: "orange", connection: "Objetos do dia a dia" },
    { id: "filmes", title: "Filmes", color: "purple", connection: "Titulos de filmes" },
  ] as WordGroup[],
  words: [
    { id: "tile-01", label: "Leao", groupId: "animais" },
    { id: "tile-02", label: "Tigre", groupId: "animais" },
    { id: "tile-03", label: "Lobo", groupId: "animais" },
    { id: "tile-04", label: "Zebra", groupId: "animais" },
    { id: "tile-05", label: "Pizza", groupId: "comidas" },
    { id: "tile-06", label: "Sushi", groupId: "comidas" },
    { id: "tile-07", label: "Bolo", groupId: "comidas" },
    { id: "tile-08", label: "Feijao", groupId: "comidas" },
    { id: "tile-09", label: "Cadeira", groupId: "objetos" },
    { id: "tile-10", label: "Relogio", groupId: "objetos" },
    { id: "tile-11", label: "Chave", groupId: "objetos" },
    { id: "tile-12", label: "Livro", groupId: "objetos" },
    { id: "tile-13", label: "Titanic", groupId: "filmes" },
    { id: "tile-14", label: "Avatar", groupId: "filmes" },
    { id: "tile-15", label: "Matrix", groupId: "filmes" },
    { id: "tile-16", label: "Gladiador", groupId: "filmes" },
  ],
};