import { useEffect, useState } from "react";
import { getActors } from "../services/actor.api";
import { Actor } from "../types/actor";

export function ActorSelect() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActorId, setSelectedActorId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getActors()
      .then((actorList) => {
        setActors(actorList);
        setSelectedActorId(actorList[0]?.id ?? "");
      })
      .catch(() => {
        setErrorMessage("Failed to load actors.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <section>
      <h2>Actor</h2>
      {isLoading ? <p>Loading actors...</p> : null}
      {errorMessage ? <p>{errorMessage}</p> : null}
      {!isLoading && !errorMessage ? (
        <select
          value={selectedActorId}
          onChange={(event) => setSelectedActorId(event.target.value)}
        >
          {actors.map((actor) => (
            <option key={actor.id} value={actor.id}>
              {actor.name}
            </option>
          ))}
        </select>
      ) : null}
    </section>
  );
}
