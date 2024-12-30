// questions.js

// 5 Kategorien × 5 Fragen
const categories = [
    {
      title: "Allgemeinwissen",
      questions: [
        {
          value: 100,
          question: "Welcher Planet ist der dritte von der Sonne?",
          answer: "Erde",
          used: false
        },
        {
          value: 200,
          question: "Wie viele Bundesländer hat Deutschland?",
          answer: "16",
          used: false
        },
        {
          value: 300,
          question: "Wer malte die berühmte 'Mona Lisa'?",
          answer: "Leonardo da Vinci",
          used: false
        },
        {
          value: 400,
          question: "Wie heißt die Hauptstadt von Österreich?",
          answer: "Wien",
          used: false
        },
        {
          value: 500,
          question: "In welchem Jahr fiel die Berliner Mauer?",
          answer: "1989",
          used: false
        }
      ]
    },
    {
      title: "Sport",
      questions: [
        {
          value: 100,
          question: "Wie viele Spieler hat eine Fußballmannschaft auf dem Feld?",
          answer: "11",
          used: false
        },
        {
          value: 200,
          question: "Welches Land hat die meisten WM-Titel im Fußball?",
          answer: "Brasilien",
          used: false
        },
        {
          value: 300,
          question: "Wo fanden 1972 die Olympischen Sommerspiele in Deutschland statt?",
          answer: "München",
          used: false
        },
        {
          value: 400,
          question: "In welcher Sportart wird um den Stanley Cup gespielt?",
          answer: "Eishockey",
          used: false
        },
        {
          value: 500,
          question: "Welcher Tennisspieler hat die meisten Grand-Slam-Titel (Herren)?",
          answer: "Novak Djokovic",
          used: false
        }
      ]
    },
    {
      title: "Filme",
      questions: [
        {
          value: 100,
          question: "Wer spielte Jack Sparrow in 'Fluch der Karibik'?",
          answer: "Johnny Depp",
          used: false
        },
        {
          value: 200,
          question: "In welchem Film wird der Satz 'Ich bin dein Vater' gesagt?",
          answer: "Star Wars (Episode V)",
          used: false,
          image : "images/test.jpg"
        },
        {
          value: 300,
          question: "Welcher Regisseur ist bekannt für Filme wie 'Psycho' und 'Vertigo'?",
          answer: "Alfred Hitchcock",
          used: false,
          sound: "sounds/test.wav"
        },
        {
          value: 400,
          question: "Wer spielte 'Forrest Gump'?",
          answer: "Tom Hanks",
          used: false
        },
        {
          value: 500,
          question: "In welcher Filmreihe kommt die Figur 'Gollum' vor?",
          answer: "Der Herr der Ringe",
          used: false
        }
      ]
    },
    {
      title: "Musik",
      questions: [
        {
          value: 100,
          question: "Welche Band sang 'Hey Jude'?",
          answer: "The Beatles",
          used: false
        },
        {
          value: 200,
          question: "Wie heißt der 'King of Pop'?",
          answer: "Michael Jackson",
          used: false
        },
        {
          value: 300,
          question: "Wer komponierte die 9. Sinfonie (Ode an die Freude)?",
          answer: "Ludwig van Beethoven",
          used: false
        },
        {
          value: 400,
          question: "Welche Sängerin wurde bekannt durch den Song 'Like a Virgin'?",
          answer: "Madonna",
          used: false
        },
        {
          value: 500,
          question: "Welcher Komponist schrieb die Oper 'Die Zauberflöte'?",
          answer: "Wolfgang Amadeus Mozart",
          used: false
        }
      ]
    },
    {
      title: "Geschichte",
      questions: [
        {
          value: 100,
          question: "Wer war der erste Bundeskanzler der BRD?",
          answer: "Konrad Adenauer",
          used: false
        },
        {
          value: 200,
          question: "Wann begann der Zweite Weltkrieg?",
          answer: "1939",
          used: false
        },
        {
          value: 300,
          question: "Wie hieß der Entdecker Amerikas?",
          answer: "Christoph Kolumbus",
          used: false
        },
        {
          value: 400,
          question: "Wer war der erste Mensch auf dem Mond?",
          answer: "Neil Armstrong",
          used: false
        },
        {
          value: 500,
          question: "In welcher Stadt steht der Eiffelturm?",
          answer: "Paris",
          used: false
        }
      ]
    }
  ];
  
  // Beispiel: max. 4 Spieler
  // Hier definieren wir die Voreinstellung: z.B. 4
  let maxPlayers = 4;
  
  // Hier definieren wir ein Array für die Spieler. 
  // Du kannst das später dynamisch befüllen (z.B. über ein Prompt oder ein Formular).
  const players = [
    { name: "Spieler 1", score: 0 },
    { name: "Spieler 2", score: 0 },
    { name: "Spieler 3", score: 0 },
    { name: "Spieler 4", score: 0 }
  ];
  
  // Final Jeopardy Beispiel
  const finalJeopardyQuestion = "Welche Stadt ist die Hauptstadt von Frankreich?";
  const finalJeopardyAnswer = "Paris";
  