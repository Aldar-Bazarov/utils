function containsCyrillic(str) {
  const cyrillicPattern = /[\u0400-\u04FF]/;
  return cyrillicPattern.test(str);
}

function containsAnyAuthor(str) {
  const authors = [""];
  return authors.some((author) => str.includes(author));
}

async function deleteRussianAduio() {
  const audios = [...document.getElementsByClassName("audio_row")]
    .slice(18)
    .map((el) => {
      const audioInfo = AudioUtils.getAudioFromEl(el);
      return {
        audioId: audioInfo[0],
        ownerId: audioInfo[1],
        audioName: audioInfo[3],
        audioAuthor: audioInfo[4],
        deleteHash: audioInfo[13].split("/")[3],
      };
    })
    .filter((audio) => {
      return containsAnyAuthor(audio.audioAuthor);
    });

  console.log("Треков:", audios.length);

  audios.forEach(async (audio, i) => {
    await new Promise((resolve) => {
      const requestDone = (log) => {
        console.log(log, ":", i + 1, "/", audios.length);
        setTimeout(resolve, 100);
      };

      ajax.post(
        "al_audio.php",
        {
          act: "delete_audio",

          aid: audio.audioId,

          al: 1,

          hash: audio.deleteHash,

          oid: audio.ownerId,
        },
        {
          onDone: () => requestDone("Удалено"),

          onFail: () => requestDone("Не удалено"),
        },
      );
    });
  });
}

deleteRussianAduio();
