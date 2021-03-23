import { useState, useEffect, useCallback, useRef } from "react";
import { useToasts } from "react-toast-notifications";

import { Auth, Storage } from "aws-amplify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Admin = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const { addToast } = useToasts();
  // Cognito IdentityPoolId
  const cognitoId = useRef(null);

  const currentUserInfo = useCallback(async () => {
    return await Auth.currentUserInfo();
  }, []);

  useEffect(() => {
    currentUserInfo().then(
      (userInfo) => (cognitoId.current = userInfo ? userInfo.id : null)
    );
  }, [currentUserInfo]);

  const handleOnChange = (e) => {
    setSelectedImage((image) => e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      if (!selectedImage) return;
      const key = `images/${selectedImage.name}`,
        file = selectedImage,
        config = { contentType: selectedImage.type, level: "private" };
      await Storage.put(key, file, config);
      setSelectedImage((image) => null);
      addToast("Image uploaded successfully", { appearance: "success" });
    } catch (err) {
      addToast(err.message || err, { appearance: "error" });
    }
  };
  return (
    <section className="section">
      <div>
        <h1 className="title">Upload a new Image</h1>
        <div className="columns">
          <div className="column is-narrow">
            <div className="file is-info is-right has-name">
              <label className="file-label">
                <input
                  className="file-input"
                  type="file"
                  name="image"
                  accept="image/png, image/jpeg"
                  onChange={handleOnChange}
                />
                <span className="file-cta">
                  <span className="file-icon">
                    <FontAwesomeIcon icon="upload" />
                  </span>
                  <span className="file-label">Browse Image</span>
                </span>
                <span className="file-name">
                  {selectedImage ? selectedImage.name : "No Image selected"}
                </span>
              </label>
            </div>
          </div>
          <div className="column">
            <button
              className="button is-primary"
              onClick={handleUpload}
              disabled={!selectedImage}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Admin;
