from django import forms

class UploadForm(forms.Form):
    arquivo_csv = forms.FileField(
        label='Selecione seu extrato csv',
        widget=forms.FileInput(attrs={'accept': '.csv'})
    )