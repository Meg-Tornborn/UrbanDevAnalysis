from flask import Flask, render_template, request, jsonify
import csv
import io

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/countries', methods=['POST'])
def get_countries():
    file = request.files['file']
    if not file:
        return jsonify({'error': 'Файл не завантажено'}), 400

    stream = io.StringIO(file.stream.read().decode("utf-8"))
    reader = csv.DictReader(stream)

    countries = sorted(set(row['Country'] for row in reader if row['Country'].strip()))
    return jsonify({'countries': countries})

@app.route('/data', methods=['POST'])
def get_data():
    country = request.form.get('country')
    file = request.files['file']
    if not file or not country:
        return jsonify({'error': 'Необхідно вказати країну і завантажити файл'}), 400

    stream = io.StringIO(file.stream.read().decode("utf-8"))
    reader = csv.DictReader(stream)

    years, population, schools, hospitals, roads = [], [], [], [], []

    for row in reader:
        if row['Country'] == country:
            years.append(row['Year'])
            population.append(int(float(row['Population'])))
            schools.append(float(row['Infrastructure.Schools.Per100k']))
            hospitals.append(float(row['Infrastructure.Hospitals.Per100k']))
            roads.append(float(row['Infrastructure.RoadLength.KmPerCapita']))

    return jsonify({
        'years': years,
        'population': population,
        'schools': schools,
        'hospitals': hospitals,
        'roads': roads
    })

if __name__ == '__main__':
    app.run(debug=True)
