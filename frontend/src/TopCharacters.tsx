import { useState } from "react";
import { BarChartTM } from "./BarChartTM";
import { Autocomplete, TextField } from "@mui/material";
import { COLORS } from "./utils";
import { RelationshipModal } from "./RelationshipModal";
import { sortBy } from "lodash-es";
import { useDataContext } from "./DataContext";

export function TopCharacters() {
  const { characters, relationships } = useDataContext();
  const [search, setSearch] = useState<string>("");
  const [selectedRelationship, setSelectedRelationship] = useState<string>();

  const relCountDict: Record<
    string,
    {
      name: string;
      count: number;
      fromName: string;
      toName: string;
    }
  > = {};
  Object.entries(relationships).forEach(([fromName, rel]) =>
    Object.entries(rel).forEach(([toName, r]) => {
      if (fromName === toName) return;
      if (!characters[fromName] || !characters[toName]) return;
      const key = [
        characters[fromName].shortName || fromName,
        characters[toName].shortName || toName,
      ]
        .sort()
        .join(" & ");
      relCountDict[key] = {
        name: key,
        count: r.length,
        fromName,
        toName,
      };
    })
  );
  let relCounts = Object.values(relCountDict);
  relCounts.sort((a, b) => b.count - a.count);
  if (search) {
    relCounts = relCounts.filter(
      (d) => search === d.fromName || search === d.toName || search === d.name
    );
  }

  const topRels = relCounts.slice(0, 10);

  const charterOptions = sortBy(
    Object.keys(characters),
    (c) => characters[c].count * -1
  );

  const selectedItem = relCountDict[selectedRelationship!];
  return (
    <>
      {selectedRelationship && (
        <RelationshipModal
          title={`${selectedRelationship.split(" & ").join(" and ")}`}
          onClose={() => setSelectedRelationship(undefined)}
          relationship={
            relationships[selectedItem.fromName][selectedItem.toName]
          }
        />
      )}
      <Autocomplete
        value={search}
        onChange={(e, opt) => setSearch(opt)}
        options={charterOptions}
        renderInput={(params) => (
          <TextField label="Search characters" {...params} />
        )}
      />
      <BarChartTM
        data={topRels.map((d) => ({
          id: d.name,
          label: d.name,
          amount: d.count,
          color: COLORS[2],
        }))}
        onClick={(d) => {
          setSelectedRelationship(d.id);
        }}
      />
    </>
  );
}
