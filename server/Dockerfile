FROM python:3.8-slim-buster
WORKDIR /python-docker
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY run_dev_server.sh .
RUN chmod +x run_dev_server.sh
CMD ["./run_dev_server.sh"]