export default {
  defaultSelectedCharacter: "Lee Scoresby",
  sharedCharacters: true,
  relationships: {
    timelineOptions: [
      {
        label: "Lyra's Parents Feelings for her",
        relationships: [
          { from: "Mrs. Coulter", to: "Lyra" },
          { from: "Lord Asriel", to: "Lyra" },
        ],
      },
      {
        label: "Lyra's Feelings",
        relationships: [
          {
            to: "Mrs. Coulter",
            from: "Lyra",
            name: "for her mom",
          },
          {
            to: "Lord Asriel",
            from: "Lyra",
            name: "for her dad",
          },
          { to: "Will", from: "Lyra", name: "for Will" },
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
