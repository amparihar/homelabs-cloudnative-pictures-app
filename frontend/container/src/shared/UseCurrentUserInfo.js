import { useState, useEffect, useCallback } from "react";
import { Auth } from "aws-amplify";

const CurrentUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);

  const currentUserInfo = useCallback(async () => {
    return await Auth.currentUserInfo();
  }, []);

  useEffect(() => {
    currentUserInfo().then((userInfo) => {
      if (userInfo && Object.keys(userInfo).length) {
        setUserInfo((prev) => ({ ...prev, ...userInfo }));
      }
    });
  }, [currentUserInfo]);

  return { userInfo };
};

export const useCurrentUserInfo = CurrentUserInfo;
