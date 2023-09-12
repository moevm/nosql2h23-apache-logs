# Дока по найстройке линтера и форматтера

1. Установите зависимости из requirements
2. Запустите `pre-commit install`

   Теперь при выполении git commit будут запускатся pre-hook, которые автоматически пофиксят staged файлы, либо выкинут ошибку.
3. (опционально) При использовании VS code можно настроить black по сохранению файла

   3.1 Python расширение для VS code

   3.2 Ruff расширение для VSCode (charliermarsh.ruff)

   3.3 Добавьте в `User settings.json` (ctrl + shift + P) настройки:
    ```
    "editor.formatOnSave": true,
    "python.formatting.provider": "black",
    "[python]": {
        "editor.formatOnType": true
    },
    ```

    В результате при сохранени файла у вас автоматически должен применяться black
