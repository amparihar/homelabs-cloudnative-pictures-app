import React from "react";

const Home = (props) => {
  return (
    <section className="container">
      <div className="columns features">
        <div className="column is-4">
          <div className="card is-shady">
            <div className="card-content">
              <div className="content">
                <h4>AWS Rekognition</h4>
                <p>
                  <a href="https://aws.amazon.com/rekognition/">Learn more</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="column is-4">
          <div className="card is-shady">
            <div className="card-content">
              <div className="content">
                <h4>Amazon S3</h4>
                
                <p>
                  <a href="https://aws.amazon.com/s3/">Learn more</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="column is-4">
          <div className="card is-shady">
            <div className="card-content">
              <div className="content">
                <h4>Amazon DynamoDB</h4>
                <p>
                  <a href="https://aws.amazon.com/dynamodb/">Learn more</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </section>
  );
};

export const HomePage = Home;
