

{{- define "chart-name" -}}
{{- default .Chart.Name | trim | trunc 63 }}
{{- end }}


{{- define "web-pod-selector-labels" -}}
app: pictures
tier: web
app.kubernetes.io/name: {{ include "chart-name" $ }}
app.kubernetes.io/instance: {{ $.Release.Name}}
{{- end }}

{{- define "web-container-ports" -}}
{{- range $.Values.image.ports -}}
- name: {{ .name }}
  containerPort: {{ .containerPort | default 80 }}
  protocol: {{ .protocol | default "tcp" }}
{{- end }}
{{- end}}

{{- define "web-container-resources" -}}
resources:
  limits:
    cpu: {{ .Values.resources.limits.cpu }}
    memory: {{ .Values.resources.limits.memory }}
  requests:
    cpu: {{ .Values.resources.requests.cpu }}
    memory: {{ .Values.resources.requests.memory }}
{{- end }}

{{- define "service-ports" -}}
{{- range $.Values.service.ports -}}
- name: {{ .name }}
  port: {{ .port | default 80 }}
  {{- if .targetPort }}
  targetPort: {{ .targetPort }}
  {{- end }}
  {{- if .nodePort }}
  nodePort: {{ .nodePort }}
  {{- end}}
{{- end }}
{{- end}}
