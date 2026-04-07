"use client";

import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./provider-list-panel.module.css";

type MetricLabel = "Compliance" | "Cost" | "Performance" | "Reliability";

type ProviderMetric = {
  label: MetricLabel;
  value: number;
};

export type RankedProvider = {
  name: string;
  url: string;
  score: number;
  reasoning: string;
};

const capabilityTags = ["GDPR", "ISO27001", "SOC2", "HIPAA", "PCI DSS", "CSA STAR"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function deriveMetrics(provider: RankedProvider): ProviderMetric[] {
  const h = hashString(`${provider.name}-${provider.url}`);
  const variance = (shift: number, spread: number) => ((h >> shift) % spread) - Math.floor(spread / 2);

  return [
    { label: "Compliance", value: clamp(provider.score + 4 + variance(1, 9), 52, 99) },
    { label: "Cost", value: clamp(provider.score - 6 + variance(4, 11), 48, 96) },
    { label: "Performance", value: clamp(provider.score + variance(7, 9), 50, 98) },
    { label: "Reliability", value: clamp(provider.score + 2 + variance(10, 7), 52, 99) },
  ];
}

function deriveTags(provider: RankedProvider) {
  const h = hashString(provider.url + provider.name);
  const first = h % capabilityTags.length;
  const second = (first + 2) % capabilityTags.length;
  const third = (first + 4) % capabilityTags.length;
  return [capabilityTags[first], capabilityTags[second], capabilityTags[third]];
}

function scoreTone(score: number): "positive" | "warning" | "critical" {
  if (score >= 86) return "positive";
  if (score >= 78) return "warning";
  return "critical";
}

export function ProviderListPanel({ providers }: { providers: RankedProvider[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const hydratedProviders = useMemo(
    () =>
      providers.map((provider) => ({
        ...provider,
        domain: getDomain(provider.url),
        logo: getInitials(provider.name),
        logoShape: hashString(provider.name) % 2 === 0 ? "round" : "square",
        metrics: deriveMetrics(provider),
        tags: deriveTags(provider),
      })),
    [providers],
  );

  return (
    <section className={styles.panel} aria-label="Provider ranking list">
      <div className={styles.listWrap}>
        {hydratedProviders.map((provider, index) => {
          const expanded = expandedIndex === index;
          const tone = scoreTone(provider.score);

          return (
            <article
              key={`${provider.url}-${index}`}
              className={styles.card}
              data-expanded={expanded}
              data-selected={expanded}
            >
              <button
                type="button"
                className={styles.mainRow}
                onClick={() => setExpandedIndex(expanded ? null : index)}
                aria-expanded={expanded}
                aria-controls={`provider-details-${index}`}
              >
                <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>

                <span
                  className={cn(
                    styles.logoContainer,
                    provider.logoShape === "round" ? styles.logoRound : styles.logoSquare,
                  )}
                  aria-hidden="true"
                >
                  <span className={styles.logoText}>{provider.logo}</span>
                </span>

                <span className={styles.providerText}>
                  <span className={styles.providerName}>{provider.name}</span>
                  <span className={styles.providerDomain}>{provider.domain}</span>
                </span>

                <span className={cn(styles.scorePill, styles[tone])}>
                  <span className={styles.scoreValue}>{provider.score}</span>
                  <span className={styles.scoreLabel}>Score</span>
                </span>

                <span className={styles.chevronWrap} aria-hidden="true">
                  <ChevronRight className={styles.chevron} strokeWidth={2.2} />
                </span>
              </button>

              <div className={styles.secondaryArea} id={`provider-details-${index}`}>
                <div className={styles.metricGrid}>
                  {provider.metrics.map((metric) => (
                    <div className={styles.metricRow} key={`${provider.url}-${metric.label}`}>
                      <div className={styles.metricHeader}>
                        <span>{metric.label}</span>
                        <span>{metric.value}%</span>
                      </div>
                      <div className={styles.metricTrack}>
                        <span
                          className={styles.metricFill}
                          style={{ width: `${metric.value}%` }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.tagRow}>
                  {provider.tags.map((tag) => (
                    <span key={`${provider.url}-${tag}`} className={styles.tagChip}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className={styles.expandedPanel} data-open={expanded}>
                  <p>{provider.reasoning}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
