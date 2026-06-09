import { useEffect, useState } from "react";
import { getActors } from "../services/actor.api";
import { Actor } from "../types/actor";

type ActorSelectProps = {
  value: string;
  onChange: (actorId: string) => void;
};

export function ActorSelect({ value, onChange }: ActorSelectProps) {
  const [actors, setActors] = useState<Actor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getActors()
      .then((actorList) => {
        setActors(actorList);
        if (!value) {
          onChange(actorList[0]?.id ?? "");
        }
      })
      .catch(() => {
        setErrorMessage("Failed to load actors.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <section className="actor-panel" aria-label="Actor selection">
      <h2>User</h2>
      {isLoading ? <p className="muted">Loading actors...</p> : null}
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {!isLoading && !errorMessage ? (
        <select
          className="select-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
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
