import React, { useEffect } from "react";
import "./App.css";
import { useState } from "react";
import { Currency, Rates } from "./types/Currency";
import cn from "classnames";
import {
  FormControl,
  InputLabel,
  Select,
  TextField,
  Button,
  MenuItem,
  IconButton,
} from "@mui/material";
import { BallTriangle } from "react-loader-spinner";
import { v4 as uuidv4 } from "uuid";

export enum CurrencyType {
  TO = 'to',
  Base = 'base'
};

const BASE_URL = "https://openexchangerates.org/api/";
const API_KEY = "cdfb6da4052d49ffaf13836d644ec0d9";

export const convert = (baseCurr: number, dataBase: number, dataTo: number) => {
  const dolars = baseCurr * (1 / dataBase);
  const toAmount = dolars * (dataTo / 1);

  return toAmount;
};

export const App: React.FC = () => {
  const [currencies, setCurrencies] = useState<Rates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState<Currency>({
    type: "USD",
    amount: 0,
  });

  const [toCurrency, setToCurrency] = useState<Currency>({
    type: "UAH",
    amount: 0,
  });

  const changeCurrenciesType = () => {
    const holdToCurrency = toCurrency.type;

    setToCurrency((prevCurr) => ({ ...prevCurr, type: baseCurrency.type }));
    setBaseCurrency((prevCurr) => ({ ...prevCurr, type: holdToCurrency }));
  };

  const reset = () => {
    setError(false);
    setBaseCurrency({ type: "USD", amount: 0 });
    setToCurrency({ type: "UAH", amount: 0 });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!baseCurrency.amount && !toCurrency.amount) {
      setError(true);
      return;
    }

    const dataFromServer = await fetch(
      `${BASE_URL}historical/2024-02-16.json?app_id=${API_KEY}&symbols=${toCurrency.type},${baseCurrency.type}`
    );

    const data = await dataFromServer.json();

    if (toCurrency.amount && !baseCurrency.amount) {
      setBaseCurrency((prev) => ({
        ...prev,
        amount: convert(
          toCurrency.amount,
          data.rates[toCurrency.type],
          data.rates[baseCurrency.type]
        ),
      }));
    }

    if (baseCurrency.amount) {
      console.log('hello', convert(
        baseCurrency.amount,
        data.rates[baseCurrency.type],
        data.rates[toCurrency.type]
      ))
      setToCurrency((prev) => ({
        ...prev,
        amount: convert(
          baseCurrency.amount,
          data.rates[baseCurrency.type],
          data.rates[toCurrency.type]
        ),
      }));
    }
  };

  const changeValue = (value: string, type: CurrencyType) => {

    setError(false);
    console.log('hello');

    switch (type) {
      case CurrencyType.TO:
        setToCurrency((prevCurr) => ({
          ...prevCurr,
          amount: isNaN(+value) ? prevCurr.amount : +value,
        }));
        return;

      case CurrencyType.Base:
        setBaseCurrency((prevCurr) => ({
          ...prevCurr,
          amount: isNaN(+value) ? prevCurr.amount : +value,
        }));
        return;
    }
  };

  useEffect(() => {
    setIsLoading(true);

    fetch(`${BASE_URL}currencies.json?app_id=${API_KEY}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((response) => setCurrencies(response))
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {isLoading ? (
          <BallTriangle
            height={100}
            width={100}
            radius={5}
            color="#003366"
            ariaLabel="ball-triangle-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        ) : (
          <form onSubmit={handleSubmit} className="">
            <FormControl fullWidth margin="normal">
              <InputLabel
                id="from-currency-select-label"
                className="whiteInput"
              >
                From Currency
              </InputLabel>
              <Select
                labelId="from-currency-select-label"
                className="whiteInput"
                value={baseCurrency.type}
                label="From Currency"
                onChange={(e) => setBaseCurrency((prevCurr) => ({
                  ...prevCurr,
                  type: e.target.value as string,
                }))}
              >
                {currencies &&
                  Object.keys(currencies).map((rate) => (
                    <MenuItem key={uuidv4()} value={`${rate}`}>
                      {rate}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              error={error}
              label="Amount"
              className={cn("whiteInput", { inputError: error })}
              value={baseCurrency.amount}
              onChange={(e) => changeValue(e.target.value, CurrencyType.Base)}
              fullWidth
              margin="normal"
            />

            {error && <p className="errorText">require amount</p>}

            <IconButton
              color="secondary"
              aria-label="change currencies"
              onClick={changeCurrenciesType}
            >
              <img alt="change icon" src="./icons/change_icon.svg" />
            </IconButton>

            <FormControl fullWidth margin="normal">
              <InputLabel id="to-currency-select-label">To Currency</InputLabel>
              <Select
                labelId="to-currency-select-label"
                className="whiteInput"
                value={toCurrency.type}
                label="To Currency"
                onChange={(e) =>
                  setToCurrency((prevCurr) => ({
                    ...prevCurr,
                    type: e.target.value as string,
                  }))
                }
              >
                {currencies &&
                  Object.keys(currencies).map((rate) => (
                    <MenuItem key={uuidv4()} value={`${rate}`}>
                      {rate}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              error={error}
              label="Amount"
              className={cn("whiteInput", { inputError: error })}
              value={toCurrency.amount}
              onChange={(e) => changeValue(e.target.value, CurrencyType.TO)}
              fullWidth
              margin="normal"
            />

            {error && <p className="errorText">require amount</p>}

            <div className="button_container">
              <Button
                variant="contained"
                type="submit"
                className="button"
                sx={{
                  marginTop: "20px",
                  marginRight: "20px",
                  backgroundColor: "#003366",
                  width: "240px",
                  ":hover": {
                    backgroundColor: "#002244",
                  },
                }}
              >
                Exchange
              </Button>

              <Button
                variant="contained"
                className="button"
                onClick={reset}
                sx={{
                  marginTop: "20px",
                  backgroundColor: "#003366",
                  width: "240px",
                  ":hover": {
                    backgroundColor: "#002244",
                  },
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        )}
      </header>
    </div>
  );
};
