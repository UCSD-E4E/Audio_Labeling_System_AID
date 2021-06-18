import json
import csv

def fileWrapperForJson(filename):
    with open(filename, 'r') as f:
        data = json.load(f)
        text = JsonToCsv(data) 
        print("===================================================")
        print(text)


def JsonToCsv(data, filename):
    #print(data)
    with open(filename.replace(".json", ".csv"), 'w', newline='') as csvfile:
        spamwriter = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        spamwriter.writerow(['filename', 'label', 'start', 'duration', 'max_freq', 'min_freq' 'created_at', 'last_modified', 'is_marked_for_review', 'assigned_users'])
        for audio in data:
            #print(audio)
            original_filename = audio['original_filename']
            assigned_users = audio['assigned_users']
            created_at = audio['created_at']
            filename = audio['filename']
            is_marked_for_review = audio['is_marked_for_review']
            #last_modified = audio['last_modified']
            segments = audio['segmentations']
            for region in segments:
                if len(region['annotations']) == 0:
                    label = "NO LABEL"
                else:
                    label = list(region['annotations'].values())[0]['values']['value']
                print(region)
                print(type(segments))
                print(label)
                last_modified = region['last_modified']
                end = region['end_time']
                start = region['start_time']
                max_freq = region['max_freq']
                min_freq = region['min_freq']
                spamwriter.writerow([original_filename, label, start, (end-start), max_freq, min_freq, created_at, last_modified, is_marked_for_review, assigned_users])

def JsonToText(data):
    #print(data)
    text = ""
    csv = []
    text = write_row(text, ['IN FILE', 'CLIP LENGTH', 'OFFSET', 'DURATION', 'MAX FREQ', 'MIN FREQ', 'SAMPLING RATE', 'LABEL'])
    csv.append(['IN FILE', 'CLIP LENGTH', 'OFFSET', 'DURATION', 'MAX FREQ', 'MIN FREQ','SAMPLING RATE', 'LABEL'])
    for audio in data:
        sampling_rate = audio['sampling_rate']
        clip_length = audio['clip_length']
        original_filename = audio['original_filename']       
        segments = audio['segmentations']
        for region in segments:
            if len(region['annotations']) == 0:
                label = "NO LABEL"
            else:
                label = list(region['annotations'].values())[0]['values']['value']
            end = region['end_time']
            start = region['start_time']
            max_freq = region['max_freq']
            min_freq = region['min_freq']
            text = write_row(text, [original_filename, clip_length, start, round((end-start), 4), max_freq, min_freq,  sampling_rate, label])
            csv.append([original_filename, clip_length, start, round((end-start), 4), max_freq, min_freq, sampling_rate, label])
    return text, csv

def write_row(text, row):
    print(row)
    print(len(row))
    for i in range(len(row)):
        print(i)
        text = text + str(row[i])
        if (i == (len(row) - 1)):
            text = text + "\n"
        else:
            text = text + ","
    return text
