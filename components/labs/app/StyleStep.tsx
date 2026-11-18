"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Btn } from "@/components/labs/chat/ui";
import { Icon } from "@/components/labs/Icon";
import { AppShell } from "./AppShell";
import { useCast, useEpisode } from "./CastProvider";
import { makeClips } from "./generate";
import { SaveAction, useSaveThen } from "./parts";
import { StylePicker } from "./StylePicker";
import { stylesFor } from "./tools";

/** Style: every style as a large tile, the tool's own styles first, the chosen one previewed at the right. */
export function StyleStep() {
  const router = useRouter();
  const store = useCast();
  const { ep, patch } = useEpisode();
  const styles = stylesFor(store.profile);
  const saving = useSaveThen(store.flush);
  const [chosen, setChosen] = useState(() => ep.style ?? styles.all[0].slug);
  useEffect(() => {
    patch({ style: chosen });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen]);

  const generate = () =>
    saving.go(async () => {
      // Generating starts the clips over: every one is made again and waits for a decision.
      const { gens } = await makeClips({ tool: store.tool, blocks: ep.blocks, texts: ep.texts, cast: ep.elements ?? store.profile.elements, style: chosen, episodeId: ep.id });
      patch({ gens });
      router.push(`${store.profile.steps.results}?state=new`);
    });

  return (
    <AppShell
      step="style"
      fit
      action={
        <SaveAction error={saving.error}>
          <Btn kind="primary" loading={saving.busy} icon={<Icon name="generate" size={16} />} onClick={generate}>
            Generate
          </Btn>
        </SaveAction>
      }
    >
      <StylePicker
        groups={[{ items: styles.first }, { title: "Other styles", items: styles.others }]}
        chosen={chosen}
        onChoose={setChosen}
      />
    </AppShell>
  );
}
