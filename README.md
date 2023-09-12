# apache_log_visualizer

Репозиторий студентов группы 0381 (Кирильцев, Павлов, Самойлов) по созданию визуализатора/агрегатора apache-логов.

## Формулировка задания 

Сервис сбора и визуализации логов Apache2

Задача - создать приложение, которое аггрегирует логи Apache2 в influx. 

https://github.com/influxdata/telegraf/blob/master/plugins/inputs/tail/README.md, 
https://github.com/influxdata/telegraf/blob/master/plugins/parsers/grok/README.md. 

Необходимо поддержать одновременно все файлы логов apache - access.log, error.log, other_vhosts_access.log, а также время загрузки странци как один из элементов данных. Необходимые (но не достаточные) фичи - таблица поиска по всем логом с фильтром, страница отдельной записи в логе, кастомизируемая статистика (по хостам, ip клиентов, кодам ошибок, времени загрузки страниц)
