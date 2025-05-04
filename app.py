import streamlit as st
import pandas as pd
import plotly.express as px
import numpy as np


st.set_page_config(page_title="Аналіз урбанізації", layout="wide")


# Завантаження CSV з даними
@st.cache_data
def load_data():
    df = pd.read_csv("urban_growth_forecast.csv")
    return df

df = load_data()
countries = df["Country"].unique()

st.title("📊 Інтелектуальна система для аналізу міського розвитку")

# Вибір країни
country = st.sidebar.selectbox("Оберіть країну:", countries)
df_country = df[df["Country"] == country]

tabs = st.tabs(["📈 Населення", "🏫 Інфраструктура", "📋 Дані"])

with tabs[0]:
    st.subheader(f"Прогноз зростання населення для {country}")
    fig = px.line(
        df_country,
        x="Year",
        y="Population",
        title=f"Населення {country} (1996–2028)",
        markers=True
    )
    st.plotly_chart(fig, use_container_width=True)

with tabs[1]:
    st.subheader(f"Інфраструктурні показники для {country}")

    col1, col2 = st.columns(2)
    with col1:
        fig_schools = px.line(
            df_country,
            x="Year",
            y="Infrastructure.Schools.Per100k",
            title="Кількість шкіл на 100 тис. населення",
            markers=True
        )
        st.plotly_chart(fig_schools, use_container_width=True)

        fig_road = px.line(
            df_country,
            x="Year",
            y="Infrastructure.RoadLength.KmPerCapita",
            title="Довжина доріг на душу населення",
            markers=True
        )
        st.plotly_chart(fig_road, use_container_width=True)

    with col2:
        fig_hospitals = px.line(
            df_country,
            x="Year",
            y="Infrastructure.Hospitals.Per100k",
            title="Кількість лікарень на 100 тис. населення",
            markers=True
        )
        st.plotly_chart(fig_hospitals, use_container_width=True)

with tabs[2]:
    st.subheader(f"Дані для {country}")
    st.dataframe(df_country.reset_index(drop=True))
