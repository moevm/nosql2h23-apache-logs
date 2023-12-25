# apache_log_visualizer

Репозиторий студентов группы 0381 (Кирильцев, Павлов, Самойлов) по созданию визуализатора/агрегатора apache-логов.

## Формулировка задания 

Сервис сбора и визуализации логов Apache2

Задача - создать приложение, которое аггрегирует логи Apache2 в influx. 

https://github.com/influxdata/telegraf/blob/master/plugins/inputs/tail/README.md, 
https://github.com/influxdata/telegraf/blob/master/plugins/parsers/grok/README.md. 

Необходимо поддержать одновременно все файлы логов apache - access.log, error.log, other_vhosts_access.log, а также время загрузки странци как один из элементов данных. Необходимые (но не достаточные) фичи - таблица поиска по всем логом с фильтром, страница отдельной записи в логе, кастомизируемая статистика (по хостам, ip клиентов, кодам ошибок, времени загрузки страниц)

#### Контейнеры
- __apache__ - контейнер веб-сервера, предоставляющего сайт из папки __http-files__. Порт __8080__. _(root)_
- __influxdb__ - контейнер базы данных. Порт __8086__. Для добавления пользователя (пока что hard coded) используется одноразовый контейнер __influxdb-cli__. _(root)_
- __telegraf__ - контейнер агрегатора для сбора логов веб-сервера в базу данных. _(non-root)_
- __grafana__ - контейнер визуализатора базы данных. Порт __3000__. _(root)_

#### Файлы и директории
Docker предоставляет контейнерам пространство для взаимодействия между контейнерами.

- _httpd.conf_ - файл конфигурации веб-сервера.
- _http-files_ - директория c предоставляемыми веб-сервером файлами.
- _logs_ - директория с логами веб-сервера. Добавляется автоматически.
- _telegraf.conf_ - файл конфигурации агрегатора данных. 
- _tglog_ - директория для лога работы агрегатора и дублирования обработанных данных. Добавляется автоматически.
- _provisioning_ - директория для автоматической загрузки источника данных и панели в Grafana.

#### Запуск
    sudo docker compose up (-d)


## Предварительная проверка заданий

<a href=" ./../../../actions/workflows/1_helloworld.yml" >![1. Установка и настройка выбранной БД + ЯП]( ./../../actions/workflows/1_helloworld.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/2_usecase.yml" >![2. Usecase]( ./../../actions/workflows/2_usecase.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/3_data_model.yml" >![3. Модель данных]( ./../../actions/workflows/3_data_model.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/4_prototype_store_and_view.yml" >![4. Прототип хранение и представление]( ./../../actions/workflows/4_prototype_store_and_view.yml/badge.svg)</a>

Один из запускаемых контейнеров необходим только для начальной конфигурации InfluxDB, поэтому сразу после устновки пользователя и организации он завершает своё выполнение. Это единственный контейнер, мешающий корректной проверке задания №5.  

<a href=" ./../../../actions/workflows/5_prototype_analysis.yml" >![5. Прототип анализ]( ./../../actions/workflows/5_prototype_analysis.yml/badge.svg)</a> 

<a href=" ./../../../actions/workflows/6_report.yml" >![6. Пояснительная записка]( ./../../actions/workflows/6_report.yml/badge.svg)</a>

<a href=" ./../../../actions/workflows/7_app_is_ready.yml" >![7. App is ready]( ./../../actions/workflows/7_app_is_ready.yml/badge.svg)</a>
