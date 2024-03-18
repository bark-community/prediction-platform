"use client";
import { useState, useEffect } from "react";
import { BankSnapshot, UserAccountSnapshot } from "@/lib/marginfi-utils";

interface Data {
  banksShaped: BankSnapshot[];
  userAccountsShaped: UserAccountSnapshot[];
}

const ClientComponent = () => {
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/pools");
        const data = await response.json();
        if (response.ok) {
          setData(data);
        } else {
          setError(new Error(data.error));
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error);
        } else {
          setError(new Error("An unknown error occurred"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const { banksShaped, userAccountsShaped } = data;

  return (
    <div>
      <h2>Banks</h2>
      {banksShaped.map((bank, index) => (
        <div key={index}>
          <pre>{JSON.stringify(bank, null, 2)}</pre>
        </div>
      ))}

      <h2>User Accounts</h2>
      {userAccountsShaped.map((account, index) => (
        <div key={index}>
          <pre>{JSON.stringify(account, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default ClientComponent;
