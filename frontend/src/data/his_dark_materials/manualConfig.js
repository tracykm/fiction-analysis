export default {
  defaultSelectedCharacter: "Lee Scoresby",
  sharedCharacters: true,
  relationships: {
    timelines: [
      {
        characters: ["Lyra Silvertounge", "Mrs. Coulter"],
        relationship: "Parent/Child",
        positivity: [
          {
            chapterFlat: 1,
            value: [0, 1],
            comment: ["Never heard of her", "Right, I have a daughter"],
          },
          {
            chapterFlat: 3,
            value: [5, 2],
            comment: ["She's so glamorous", "I should take an interest"],
          },
          {
            chapterFlat: 4,
            value: [7, 2],
            comment: [
              "She's badass and fascinating and she's interested in me",
              "",
            ],
          },
          {
            chapterFlat: 5,
            value: [4, 4],
            comment: [
              "Things are a little sus",
              "I'm getting kind of attached",
            ],
          },
          {
            chapterFlat: 6,
            value: [-2, 5],
            comment: ["Got to get out", "She's cleverer than I thought"],
          },
          {
            chapterFlat: 8,
            value: [-4, 5],
            comment: ["Mother?! WTF", ""],
          },
          {
            chapterFlat: 14,
            value: [-8, 5],
            comment: ["She's a monster", ""],
          },
          {
            chapterFlat: 17,
            value: [-7, 7],
            comment: [
              "A monster who cares about me",
              "NO! I was almost too late!",
            ],
          },
          {
            chapterFlat: 22,
            value: [-7, 7],
          },
          {
            chapterFlat: 23,
            value: [-5, 7],
            comment: ["Huh, she's a little more complicated", ""],
          },
          {
            chapterFlat: 38,
            value: [-5, 9],
            comment: [
              "No clue what's going on",
              "Entering my psycho mom phase",
            ],
          },
          {
            chapterFlat: 49,
            value: [-2, 8],
            comment: ["She loved me in twisted way", "Got to move on"],
          },
          {
            chapterFlat: 69,
            value: [2, 8],
            comment: [
              "She did good in the end",
              "She was almost all that mattered",
            ],
          },
        ],
      },
      {
        characters: ["Lyra Silvertounge", "Lord Asriel"],
        relationship: "Parent/Child",
        positivity: [
          {
            chapterFlat: 1,
            value: [5, 3],
            comment: ["Such adventures!", "Yep, she's a little girl"],
          },
          {
            chapterFlat: 21,
            value: [5, 3],
            comment: ["Finally made it!"],
          },
          {
            chapterFlat: 22,
            value: [-7, 3],
            comment: ["He's as bad as her"],
          },
          { chapterFlat: 26, value: [-7, 3] },
          { chapterFlat: 38, value: [-7, 3] },
          {
            chapterFlat: 46,
            value: [-3, 3],
            comment: ["Time has passed"],
          },
          {
            chapterFlat: 47,
            value: [-2, 5],
            comment: [
              "Of the options he's not the worst",
              "She's actually important",
            ],
          },
          {
            chapterFlat: 48,
            value: [-2, 4],
            comment: ["", "Whatever"],
          },
          {
            chapterFlat: 69,
            value: [2, 4],
            comment: ["He did big picture good"],
          },
        ],
      },
      {
        characters: ["Lyra Silvertounge", "Will Perry"],
        relationship: "Romanic Interest",
        positivity: [
          { chapterFlat: 26, value: [1, 1], comment: ["New guy"] },
          { chapterFlat: 28, value: [2, 2], comment: ["Murder! Cool"] },
          {
            chapterFlat: 30,
            value: [3, -2],
            comment: ["I let him down!", "Can't trust her, impulsive idiot"],
          },
          {
            chapterFlat: 32,
            value: [3, 1],
            comment: ["We're good, and I'm helpful!", "Over it"],
          },
          {
            chapterFlat: 34,
            value: [3, 3],
            comment: ["Growing more attached", "Growing more attached"],
          },
          {
            chapterFlat: 36,
            value: [5, 5],
            comment: ["Growing more attached", "Growing more attached"],
          },
          {
            chapterFlat: 38,
            value: [5, 7],
            comment: ["Out for the count", "No!! Must save"],
          },
          { chapterFlat: 49, value: [7, 7], comment: ["Reunited", "Reunited"] },
          {
            chapterFlat: 73,
            value: [9, 9],
            comment: [
              "We've been through so much, only one I can trust",
              "We've been through so much, only one I can trust",
            ],
          },
          {
            chapterFlat: 74,
            value: [10, 10],
            comment: ["What is this feeling?!", "What is this feeling?!"],
          },
        ],
      },
    ],
    timelineOptions: [
      {
        label: "Lyra's Parents Feelings for her",
        relationships: [
          { from: "Mrs. Coulter", to: "Lyra Silvertounge" },
          { from: "Lord Asriel", to: "Lyra Silvertounge" },
        ],
      },
      {
        label: "Lyra's Feelings",
        relationships: [
          {
            to: "Mrs. Coulter",
            from: "Lyra Silvertounge",
            name: "for her mom",
          },
          {
            to: "Lord Asriel",
            from: "Lyra Silvertounge",
            name: "for her dad",
          },
          { to: "Will Perry", from: "Lyra Silvertounge", name: "for Will" },
        ],
      },
    ],
  },
  characterCategories: [
    {
      name: "Species",
      options: [
        { id: "Human", label: "Human" },
        { id: "Witch", label: "Witch" },
        { id: "Angel", label: "Angel" },
        { id: "Dæmon", label: "Dæmon" },
        { id: "Mulefa", label: "Mulefa" },
        { id: "Gallivespian", label: "Gallivespian" },
        { id: "Bear", label: "Bear" },
      ],
    },
    {
      name: "Universes",
      options: [
        { id: "Lyra's World", label: "Lyra's World" },
        { id: "Will's World", label: "Will's World" },
        { id: "Angel", label: "Angel Realm" },
        { id: "Gallivespian", label: "Gallivespian's" },
        { id: "Citt\u00e0gazze", label: "Citt\u00e0gazze's" },
        { id: "Mulefa", label: "Mulefa's" },
      ],
    },
    {
      name: "Ages",
      options: [
        { id: "Adult", label: "Adult" },
        { id: "Child", label: "Child" },
      ],
    },
  ],
};
