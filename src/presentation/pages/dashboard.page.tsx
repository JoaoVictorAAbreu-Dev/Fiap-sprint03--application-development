import { RiskScoreCard } from '@/presentation/components/shared/risk-score-card';
import { SummaryCard } from '@/presentation/components/shared/summary-card';
import { VegetationMonitoringTable } from '@/presentation/components/vegetation/vegetation-monitoring-table';
import { useCurrentWeatherByLocalitiesQuery } from '@/presentation/hooks/queries/use-current-weather-by-localities.query';
import { useMonitoredLocalitiesQuery } from '@/presentation/hooks/queries/use-monitored-localities.query';
import { buildFictitiousSensingSnapshot } from '@/shared/utils/sensing-simulation.util';
import { calculateRiskScore, getRiskLevel, isAlertPoint } from '@/shared/utils/risk.util';
import { buildVegetationMonitoringPoints } from '@/shared/utils/vegetation-classification.util';

export const DashboardPage = () => {
  const localitiesQuery = useMonitoredLocalitiesQuery({ limit: 10 });
  const weatherQuery = useCurrentWeatherByLocalitiesQuery(localitiesQuery.data ?? []);

  if (localitiesQuery.isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">Carregando indicadores do monitoramento...</p>
      </section>
    );
  }

  if (localitiesQuery.isError) {
    return (
      <section className="rounded-xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-rose-900">Dashboard</h2>
        <p className="mt-2 text-sm text-rose-700">
          Falha ao carregar as localidades:{' '}
          {localitiesQuery.error instanceof Error ? localitiesQuery.error.message : 'erro desconhecido'}
        </p>
        <button
          type="button"
          onClick={() => void localitiesQuery.refetch()}
          className="mt-4 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  const localities = localitiesQuery.data ?? [];
  const weather = weatherQuery.data ?? [];
  const sensing = weather.map(buildFictitiousSensingSnapshot);
  const vegetationPoints = buildVegetationMonitoringPoints(localities);
  const hasWeatherData = !weatherQuery.isLoading && !weatherQuery.isError && weather.length > 0;

  const monitoredPoints = localities.length;
  const averageTemperature =
    weather.length > 0 ? weather.reduce((sum, item) => sum + item.temperatureC, 0) / weather.length : 0;
  const averageWindSpeed =
    weather.length > 0 ? weather.reduce((sum, item) => sum + item.windSpeedKmh, 0) / weather.length : 0;
  const averageVegetationStress =
    sensing.length > 0 ? sensing.reduce((sum, item) => sum + item.vegetationStressPct, 0) / sensing.length : 0;
  const alertPoints = weather.filter(isAlertPoint).length;
  const averageVegetationHeight =
    vegetationPoints.length > 0
      ? vegetationPoints.reduce((sum, point) => sum + point.heightCm, 0) / vegetationPoints.length
      : 0;
  const interventionPoints = vegetationPoints.filter(
    (point) => point.classification === 'Risco' || point.classification === 'Crítico',
  ).length;

  const riskByPoint = weather.map((item) => ({
    ...item,
    riskScore: calculateRiskScore(item),
  }));

  const generalRiskScore =
    riskByPoint.length > 0 ? riskByPoint.reduce((sum, item) => sum + item.riskScore, 0) / riskByPoint.length : 0;

  const mostCriticalArea = riskByPoint.reduce(
    (current, item) => (item.riskScore > current.riskScore ? item : current),
    riskByPoint[0],
  );

  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard Executivo</h2>
        <p className="mt-2 text-sm text-slate-600">
          Visão consolidada das alturas, classificações de vegetação e condições climáticas monitoradas.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard title="Pontos monitorados" value={String(monitoredPoints)} />
        <SummaryCard title="Altura média" value={`${averageVegetationHeight.toFixed(1)} cm`} />
        <SummaryCard title="Intervenções necessárias" value={String(interventionPoints)} />
        <SummaryCard title="Temperatura média" value={hasWeatherData ? `${averageTemperature.toFixed(1)} °C` : '—'} />
        <SummaryCard title="Pontos em alerta climático" value={hasWeatherData ? String(alertPoints) : '—'} />
        <SummaryCard title="Vento médio" value={hasWeatherData ? `${averageWindSpeed.toFixed(1)} km/h` : '—'} />
      </div>

      <VegetationMonitoringTable points={vegetationPoints} />

      {weatherQuery.isLoading ? (
        <p className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800" role="status">
          A classificação da vegetação já está disponível. Carregando apenas os indicadores climáticos complementares...
        </p>
      ) : null}

      {weatherQuery.isError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
          <p>Os dados climáticos estão indisponíveis, mas a classificação por altura continua funcionando.</p>
          <button
            type="button"
            onClick={() => void weatherQuery.refetch()}
            className="mt-3 rounded-md bg-amber-700 px-3 py-2 font-medium text-white hover:bg-amber-800"
          >
            Tentar carregar clima novamente
          </button>
        </div>
      ) : null}

      {hasWeatherData ? <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Area mais critica monitorada</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {mostCriticalArea ? mostCriticalArea.localityName : 'Sem dados'}
          </p>
          {mostCriticalArea ? (
            <p className="mt-2 text-sm text-slate-600">
              Temperatura {mostCriticalArea.temperatureC.toFixed(1)} degC | Vento{' '}
              {mostCriticalArea.windSpeedKmh.toFixed(1)} km/h | Precipitacao{' '}
              {mostCriticalArea.precipitationMm.toFixed(1)} mm
            </p>
          ) : null}
          {mostCriticalArea ? (
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Classificacao: {getRiskLevel(mostCriticalArea.riskScore)}
            </p>
          ) : null}
        </article>

        <RiskScoreCard
          title="Score geral de risco"
          score={generalRiskScore}
          subtitle={`Cálculo climático complementar; estresse médio da vegetação: ${averageVegetationStress.toFixed(1)}%.`}
        />
      </div> : null}
    </section>
  );
};
