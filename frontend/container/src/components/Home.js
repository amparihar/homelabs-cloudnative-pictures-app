import { useState } from "react";
import * as data from "../data/Home.json";

const Home = () => {
  const cards = useState(data.cards)[0];
  return (
    <section className="section">
      <section className="container">
        <div className="columns features">
          {cards.map((card, i) => (
            <div key={i} className="column is-4">
              {card.columns.map((column, j) => (
                <div
                  key={j}
                  className="card is-shady"
                  style={{ marginTop: "10px" }}
                >
                  <div className="card-content">
                    <div className="content">
                      <h4>{column.title}</h4>
                      <p>
                        <a href={column.uri} target="_blank" rel="noreferrer">
                          Learn more
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export const HomePage = Home;
