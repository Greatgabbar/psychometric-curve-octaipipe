// The page: loads data, works out the SLA status, and passes plain data down
// to the badge and the chart. The chart itself knows nothing about polling.

import { useState } from "react";
import { setSimulateOutage } from "./api/readingsApi";
import { PsychroChart } from "./chart/PsychroChart";
import { SlaStatusBadge } from "./components/SlaStatusBadge";
import { formatTime } from "./format";
import { useRecentReadings } from "./hooks/useRecentReadings";
import { checkCompliance } from "./sla/compliance";

const SITE_ID = "site-1";

export default function App() {
  const { data, isPending, isError, error } = useRecentReadings(SITE_ID);
  const [outage, setOutage] = useState(false);

  function handleOutageToggle(on: boolean) {
    setOutage(on);
    setSimulateOutage(on);
  }

  const outageToggle = (
    <label className="outage-toggle">
      <input
        type="checkbox"
        checked={outage}
        onChange={(e) => handleOutageToggle(e.target.checked)}
      />
      Simulate sensor outage (to see the failure state)
    </label>
  );

  // 1. Loading: nothing has arrived yet.
  if (isPending) {
    return (
      <main className="page">
        <p className="message">Waiting for the first readings…</p>
      </main>
    );
  }

  // 2. Failed before we ever got data: nothing to draw.
  if (!data) {
    return (
      <main className="page">
        <p className="message message-error">
          Couldn't load readings: {error?.message} Retrying automatically.
        </p>
        {outageToggle}
      </main>
    );
  }

  // 3. We have data. If the latest poll failed, React Query keeps the last
  //    good data and sets isError, so we show it but mark it as stale.
  const { site, readings } = data;
  const current = readings[readings.length - 1];
  const compliance = checkCompliance(current, site.envelope);
  const isStale = isError;

  return (
    <main className="page">
      <header className="page-header">
        <h1>{site.name}</h1>
        <p className="subtitle">Air condition against the cooling SLA</p>
      </header>

      <section className="summary">
        <SlaStatusBadge
          compliance={compliance}
          isStale={isStale}
          lastReadingTime={current.timestamp}
          errorMessage={error?.message}
        />
        <dl className={isStale ? "readout readout-stale" : "readout"}>
          <div>
            <dt>Temperature</dt>
            <dd>{current.dryBulbC.toFixed(1)} °C</dd>
          </div>
          <div>
            <dt>Relative humidity</dt>
            <dd>{current.rhPct.toFixed(0)} %</dd>
          </div>
          <div>
            <dt>Humidity ratio</dt>
            <dd>{compliance.humidityRatio.toFixed(1)} g/kg</dd>
          </div>
          <div>
            <dt>Reading time</dt>
            <dd>{formatTime(current.timestamp)}</dd>
          </div>
        </dl>
      </section>

      <PsychroChart
        envelope={site.envelope}
        readings={readings}
        isCompliant={compliance.isCompliant}
        isStale={isStale}
      />

      <footer className="page-footer">
        <ul className="legend">
          <li>
            <span className="swatch swatch-envelope" /> SLA envelope
          </li>
          <li>
            <span className="swatch swatch-inside" /> Inside SLA
          </li>
          <li>
            <span className="swatch swatch-outside" /> Outside SLA
          </li>
          <li>
            <span className="swatch swatch-trail" /> Last 30 minutes
          </li>
        </ul>
        {outageToggle}
      </footer>
    </main>
  );
}
